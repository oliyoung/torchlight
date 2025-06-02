#!/usr/bin/env ts-node

/**
 * SQL Schema Generator from GraphQL Schema
 * 
 * This script analyzes the GraphQL schema and generates a corresponding SQL schema.
 * It handles type mapping, relationships, and ensures consistency between GraphQL and SQL.
 */

import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const GRAPHQL_SCHEMA_PATH = 'app/api/graphql/schema.graphql';
const SQL_SCHEMA_PATH = 'app/api/graphql/schema.sql';

interface Field {
  name: string;
  type: string;
  nullable: boolean;
  isArray: boolean;
  isRelation: boolean;
  relationTo?: string;
}

interface GraphQLType {
  name: string;
  fields: Field[];
  isEnum: boolean;
  enumValues?: string[];
}

class SQLSchemaGenerator {
  private types: Map<string, GraphQLType> = new Map();
  private enums: Map<string, string[]> = new Map();
  private manyToManyRelations: Array<{
    tableName: string;
    leftTable: string;
    rightTable: string;
    leftField: string;
    rightField: string;
  }> = [];

  // Core entity types that should have tables
  private coreEntities = new Set(['Coach', 'CoachBilling', 'Assistant', 'Athlete', 'Goal', 'SessionLog', 'TrainingPlan', 'AIMetadata']);
  
  // Types that are embedded/response types, not separate tables
  private responseTypes = new Set([
    'GoalEvaluationResponse', 'CoreGoal', 'GoalEvaluation', 'EvaluationSummary', 
    'RefinedGoalSuggestion', 'Timeline', 'Motivation', 'Availability', 'Constraints',
    'SuccessIndicators', 'ExtractionConfidence', 'CoachingFeedback'
  ]);

  /**
   * Parse GraphQL schema and extract types
   */
  parseGraphQLSchema(schemaContent: string): void {
    const lines = schemaContent.split('\n');
    let currentType: GraphQLType | null = null;
    let insideType = false;
    let insideEnum = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      // Skip comments and empty lines
      if (line.startsWith('#') || line.startsWith('"""') || line === '') {
        continue;
      }

      // Start of type definition
      if (line.startsWith('type ') && !line.includes('Query') && !line.includes('Mutation') && !line.includes('Subscription')) {
        const typeName = line.split(' ')[1];
        currentType = { name: typeName, fields: [], isEnum: false };
        insideType = true;
        continue;
      }

      // Start of enum definition
      if (line.startsWith('enum ')) {
        const enumName = line.split(' ')[1];
        currentType = { name: enumName, fields: [], isEnum: true, enumValues: [] };
        insideEnum = true;
        continue;
      }

      // End of type/enum
      if (line === '}' && (insideType || insideEnum)) {
        if (currentType) {
          if (currentType.isEnum) {
            this.enums.set(currentType.name, currentType.enumValues || []);
          } else {
            this.types.set(currentType.name, currentType);
          }
        }
        currentType = null;
        insideType = false;
        insideEnum = false;
        continue;
      }

      // Parse enum values
      if (insideEnum && currentType) {
        let enumValue = line.trim();
        if (enumValue.includes('#')) {
          enumValue = enumValue.split('#')[0].trim();
        }
        if (enumValue && enumValue !== '') {
          currentType.enumValues = currentType.enumValues || [];
          currentType.enumValues.push(enumValue);
        }
        continue;
      }

      // Parse fields
      if (insideType && currentType && line.includes(':')) {
        const field = this.parseField(line);
        if (field) {
          currentType.fields.push(field);
        }
      }
    }
  }

  /**
   * Parse a GraphQL field line
   */
  private parseField(line: string): Field | null {
    const fieldMatch = line.match(/^\s*(\w+):\s*(\[?[\w!]+\]?!?)/);
    if (!fieldMatch) return null;

    const [, name, typeStr] = fieldMatch;
    
    // Skip certain fields that don't belong in SQL
    if (['__typename', 'node', 'edges', 'pageInfo'].includes(name)) {
      return null;
    }

    const isArray = typeStr.includes('[');
    const nullable = !typeStr.includes('!');
    let type = typeStr.replace(/[\[\]!]/g, '');

    // Determine if this is a relation field
    const isRelation = this.isRelationType(type);
    const relationTo = isRelation ? type : undefined;

    return {
      name,
      type,
      nullable,
      isArray,
      isRelation,
      relationTo
    };
  }

  /**
   * Check if a type is a relation (references another entity)
   */
  private isRelationType(type: string): boolean {
    const scalarTypes = ['String', 'Int', 'Float', 'Boolean', 'DateTime', 'JSON', 'ID'];
    const enumTypes = Array.from(this.enums.keys());
    return !scalarTypes.includes(type) && !enumTypes.includes(type);
  }

  /**
   * Map GraphQL types to SQL types
   */
  private mapToSQLType(graphqlType: string): string {
    const typeMap: Record<string, string> = {
      'ID': 'SERIAL PRIMARY KEY',
      'String': 'VARCHAR(255)',
      'Int': 'INTEGER',
      'Float': 'FLOAT',
      'Boolean': 'BOOLEAN',
      'DateTime': 'TIMESTAMP',
      'JSON': 'JSONB'
    };

    return typeMap[graphqlType] || 'VARCHAR(255)';
  }

  /**
   * Convert camelCase to snake_case
   */
  private toSnakeCase(str: string): string {
    return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
  }

  /**
   * Convert type name to table name
   */
  private toTableName(typeName: string): string {
    // Use specific table names to match existing schema
    const tableNameMap: Record<string, string> = {
      'Coach': 'coaches',
      'CoachBilling': 'coach_billing', 
      'Assistant': 'assistants',
      'Athlete': 'athletes',
      'Goal': 'goals',
      'SessionLog': 'session_logs',
      'TrainingPlan': 'training_plans',
      'AIMetadata': 'ai_metadata'
    };
    
    return tableNameMap[typeName] || this.toSnakeCase(typeName.toLowerCase()) + 's';
  }

  /**
   * Generate SQL schema
   */
  generateSQLSchema(): string {
    // Filter to only core entities (not response types)
    const coreTypes = Array.from(this.types.values())
      .filter(type => this.coreEntities.has(type.name))
      .sort((a, b) => {
        // Order tables by dependencies
        const order = ['Coach', 'CoachBilling', 'Assistant', 'Athlete', 'Goal', 'SessionLog', 'TrainingPlan', 'AIMetadata'];
        return order.indexOf(a.name) - order.indexOf(b.name);
      });

    let sql = `-- Drop tables if they exist (drop join tables first to avoid FK errors)
`;

    // Drop statements for join tables first  
    const joinTables = ['training_plan_session_logs', 'training_plan_goals', 'training_plan_assistants', 'goal_session_logs'];
    for (const table of joinTables) {
      sql += `DROP TABLE IF EXISTS ${table} CASCADE;\n`;
    }

    // Drop main tables in reverse dependency order
    for (const type of coreTypes.reverse()) {
      sql += `DROP TABLE IF EXISTS ${this.toTableName(type.name)} CASCADE;\n`;
    }

    sql += '\n-- =========================\n-- 1. Base Tables\n-- =========================\n\n';

    // Generate main tables in dependency order
    for (const type of coreTypes.reverse()) {
      sql += this.generateTableSQL(type);
      sql += '\n';
    }

    // Generate join tables
    sql += '-- =========================\n-- 2. Join Tables (many-to-many)\n-- =========================\n\n';
    sql += this.generateJoinTables();

    // Add fixture data
    sql += '-- =========================\n-- 3. Fixture Data\n-- =========================\n\n';
    sql += this.generateFixtureData();

    return sql;
  }

  /**
   * Generate SQL for a single table
   */
  private generateTableSQL(type: GraphQLType): string {
    const tableName = this.toTableName(type.name);
    let sql = `-- ${type.name} table\nCREATE TABLE ${tableName} (\n`;

    const columns: string[] = [];

    // Handle special cases for each table type
    if (type.name === 'Coach') {
      columns.push('    id SERIAL PRIMARY KEY');
      columns.push('    user_id VARCHAR(255) UNIQUE NOT NULL'); // Supabase auth user UUID
    } else if (type.name === 'CoachBilling') {
      columns.push('    id SERIAL PRIMARY KEY');
      columns.push('    coach_id INTEGER UNIQUE NOT NULL REFERENCES coaches(id) ON DELETE CASCADE');
    } else if (type.name === 'Assistant') {
      columns.push('    id SERIAL PRIMARY KEY');
    } else if (type.name === 'AIMetadata') {
      columns.push('    session_log_id INTEGER PRIMARY KEY REFERENCES session_logs(id) ON DELETE CASCADE');
    } else {
      columns.push('    id SERIAL PRIMARY KEY');
      // Add user_id for user-scoped tables (all except those handled above)
      columns.push('    user_id VARCHAR(255) NOT NULL');
    }

    for (const field of type.fields) {
      // Skip id, userId, coachId fields (handled above)
      if (field.name === 'id' || field.name === 'userId' || 
          (field.name === 'coachId' && type.name === 'CoachBilling')) continue;
      
      if (field.isRelation && !field.isArray) {
        // Single relation - add foreign key
        let refTable = this.toTableName(field.relationTo!);
        let columnName = this.toSnakeCase(field.name);
        
        // Special handling for specific relations
        if (!columnName.endsWith('_id')) {
          if (field.name === 'athlete') columnName = 'athlete_id';
          else if (field.name === 'coach') columnName = 'coach_id';
          else if (field.name === 'billing') columnName = 'billing_id';
          else columnName += '_id';
        }
        
        const nullable = field.nullable ? '' : ' NOT NULL';
        
        // Handle enum foreign keys as direct values instead of references
        if (this.enums.has(field.relationTo!)) {
          let sqlType = 'VARCHAR(50)';
          const defaultValue = this.getDefaultValue(field);
          columns.push(`    ${columnName} ${sqlType}${nullable}${defaultValue}`);
        } else {
          columns.push(`    ${columnName} INTEGER${nullable} REFERENCES ${refTable}(id)`);
        }
      } else if (field.isRelation && field.isArray) {
        // Skip array relations - handled in join tables
        continue;
      } else if (!field.isRelation) {
        // Regular field
        const columnName = this.toSnakeCase(field.name);
        let sqlType = this.mapToSQLType(field.type);
        
        // Handle special field types
        if (field.isArray && field.type === 'String') {
          sqlType = 'TEXT[]';
        } else if (field.type === 'DateTime') {
          sqlType = 'TIMESTAMP';
        } else if (field.type === 'JSON') {
          sqlType = 'JSONB';
        } else if (this.enums.has(field.type)) {
          // Handle enum fields as VARCHAR for now
          sqlType = 'VARCHAR(50)';
        } else if (field.name === 'createdAt' || field.name === 'updatedAt') {
          // Ensure timestamp fields are TIMESTAMP, not VARCHAR
          sqlType = 'TIMESTAMP';
        }

        const nullable = field.nullable ? '' : ' NOT NULL';
        const defaultValue = this.getDefaultValue(field);
        
        columns.push(`    ${columnName} ${sqlType}${nullable}${defaultValue}`);
      }
    }

    // Add standard audit fields for most tables
    const fieldNames = type.fields.map(f => f.name);
    if (type.name !== 'AIMetadata') {
      if (!fieldNames.includes('createdAt')) {
        columns.push('    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP');
      }
      if (!fieldNames.includes('updatedAt')) {
        columns.push('    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP');
      }
      if (!fieldNames.includes('deletedAt')) {
        columns.push('    deleted_at TIMESTAMP');
      }
    }

    sql += columns.join(',\n');
    sql += '\n);\n';

    return sql;
  }

  /**
   * Generate all join tables based on the original schema
   */
  private generateJoinTables(): string {
    return `-- Join table: goal_session_logs (many-to-many)
CREATE TABLE goal_session_logs (
    goal_id INTEGER NOT NULL REFERENCES goals(id) ON DELETE CASCADE,
    session_log_id INTEGER NOT NULL REFERENCES session_logs(id) ON DELETE CASCADE,
    PRIMARY KEY (goal_id, session_log_id)
);

-- Join table: training_plan_assistants (many-to-many)
CREATE TABLE training_plan_assistants (
    training_plan_id INTEGER NOT NULL REFERENCES training_plans(id) ON DELETE CASCADE,
    assistant_id INTEGER NOT NULL REFERENCES assistants(id) ON DELETE CASCADE,
    PRIMARY KEY (training_plan_id, assistant_id)
);

-- Join table: training_plan_goals (many-to-many)
CREATE TABLE training_plan_goals (
    training_plan_id INTEGER NOT NULL REFERENCES training_plans(id) ON DELETE CASCADE,
    goal_id INTEGER NOT NULL REFERENCES goals(id) ON DELETE CASCADE,
    PRIMARY KEY (training_plan_id, goal_id)
);

-- Join table: training_plan_session_logs (many-to-many)
CREATE TABLE training_plan_session_logs (
    training_plan_id INTEGER NOT NULL REFERENCES training_plans(id) ON DELETE CASCADE,
    session_log_id INTEGER NOT NULL REFERENCES session_logs(id) ON DELETE CASCADE,
    PRIMARY KEY (training_plan_id, session_log_id)
);

`;
  }

  /**
   * Generate fixture data from original schema
   */
  private generateFixtureData(): string {
    return `-- Fixture data for assistants (basketball)
INSERT INTO assistants (id, name, sport, role, strengths, bio, prompt_template, created_at, updated_at) VALUES
(1, 'Coach Maverick', 'Basketball', 'Guard', ARRAY['Ball Handling', 'Basketball IQ', 'Pick-and-Roll Execution'], 'A seasoned floor general who teaches guards how to read defenses, run plays, and lead the offense with precision.', 'Create a 1-week training plan to enhance {goal} for a basketball guard. Focus on ball handling and decision-making under pressure.', NOW(), NOW()),
(2, 'Coach Titan', 'Basketball', 'Center', ARRAY['Rim Protection', 'Post Defense', 'Shot Blocking'], 'A defensive anchor with a focus on timing, footwork, and paint dominance. Teaches how to protect the rim without fouling.', 'Design a training schedule to boost rim protection skills for a basketball center. Include shot-blocking drills and positioning strategies.', NOW(), NOW()),
(3, 'Coach Blaze', 'Basketball', 'Wing', ARRAY['Shooting', 'Off-Ball Movement', 'Shot Creation'], 'An offensive specialist who trains players to create space, move without the ball, and become lethal from the perimeter.', 'Build a custom training routine to improve shooting consistency and off-ball awareness for a basketball wing.', NOW(), NOW()),
(4, 'Coach Nova', 'Basketball', 'Forward', ARRAY['Transition Offense', 'Finishing', 'Athleticism'], 'Brings explosive energy and speed-focused drills to enhance fast breaks, driving lanes, and above-the-rim finishes.', 'Develop a 5-day plan for boosting transition scoring and finishing at the rim for an athletic forward.', NOW(), NOW()),
(5, 'Coach Ice', 'Basketball', 'Guard', ARRAY['Clutch Performance', 'Free Throws', 'End-of-Game Execution'], 'A calm and collected leader who thrives under pressure. Specializes in teaching composure, free throw routines, and end-of-game execution for guards.', 'Outline a training strategy to build composure and efficiency in clutch moments for a basketball guard.', NOW(), NOW()),
(6, 'Coach Atlas', 'Basketball', 'Center', ARRAY['Rebounding', 'Strength Training', 'Box Out Fundamentals'], 'A physicality-first coach who teaches players to control the glass with technique, strength, and hustle.', 'Craft a strength-focused training plan that emphasizes rebounding technique and box-out fundamentals.', NOW(), NOW()),
(7, 'Coach Vibe', 'Basketball', 'Wing', ARRAY['Team Chemistry', 'Communication', 'Court Awareness'], 'Believes that great players make their teammates better. Focuses on awareness, unselfish play, and leadership.', 'Generate a training routine that builds communication, team cohesion, and court awareness for a versatile wing.', NOW(), NOW()),
(8, 'Coach Spark', 'Basketball', 'Guard', ARRAY['Quickness', 'Agility', 'Full-Court Pressure'], 'A high-energy coach who thrives on intensity. Trains guards to press, harass ball handlers, and change pace effectively.', 'Prepare a high-intensity plan to improve quickness, agility, and pressure defense for a basketball guard.', NOW(), NOW()),
(9, 'Coach Prism', 'Basketball', 'Forward', ARRAY['Defensive Switching', 'Versatility', 'Tactical IQ'], 'A versatile forward who excels at defensive switching and tactical play. Coaches players to read the game, adapt on the fly, and contribute in multiple roles.', 'Design a week-long training block for a forward focused on defensive switching, versatility, and tactical IQ.', NOW(), NOW()),
(10, 'Coach Echo', 'Basketball', 'Any', ARRAY['Film Study', 'Self-Assessment', 'Growth Mindset'], 'A reflective coach focused on reviewing past performances to drive future improvement through self-awareness.', 'Generate a training program that includes film breakdown, reflection prompts, and self-assessment for any basketball role.', NOW(), NOW());

-- Fixture data for athletes
INSERT INTO athletes (user_id, first_name, last_name, email, tags, notes, sport, birthday, gender, fitness_level, training_history, height, weight, created_at, updated_at, deleted_at) VALUES
('123', 'Alice', 'Smith', 'alice.smith1@example.com', ARRAY['athlete','yoga'], 'Loves yoga. See https://placekitten.com/200/200', 'Yoga', '1990-01-01', 'Female', 'Intermediate', '5 years of yoga', 165.0, 60.0, NOW(), NOW(), NULL),
('123', 'Bob', 'Johnson', 'bob.johnson2@example.com', ARRAY['runner'], 'Marathon runner. https://placekitten.com/201/200', 'Running', '1985-05-12', 'Male', 'Advanced', '10 marathons', 180.0, 75.0, NOW(), NOW(), NULL),
('123', 'Carol', 'Williams', 'carol.williams3@example.com', ARRAY['swimmer'], 'Competitive swimmer.', 'Swimming', '1992-03-15', 'Female', 'Advanced', 'Swims daily', 170.0, 62.0, NOW(), NOW(), NULL),
('123', 'David', 'Brown', 'david.brown4@example.com', ARRAY['basketball'], 'Plays center.', 'Basketball', '1988-07-22', 'Male', 'Intermediate', 'Plays in local league', 200.0, 95.0, NOW(), NOW(), NULL),
('123', 'Eva', 'Jones', 'eva.jones5@example.com', ARRAY['triathlete'], 'Training for first triathlon.', 'Triathlon', '1995-11-30', 'Female', 'Beginner', 'New to triathlon', 168.0, 58.0, NOW(), NOW(), NULL),
('123', 'Frank', 'Garcia', 'frank.garcia6@example.com', ARRAY['soccer'], 'Midfielder.', 'Soccer', '1991-09-10', 'Male', 'Intermediate', 'Plays weekly', 175.0, 70.0, NOW(), NOW(), NULL),
('123', 'Grace', 'Martinez', 'grace.martinez7@example.com', ARRAY['tennis'], 'Loves doubles.', 'Tennis', '1987-04-18', 'Female', 'Advanced', 'Competes in tournaments', 160.0, 55.0, NOW(), NOW(), NULL),
('123', 'Henry', 'Rodriguez', 'henry.rodriguez8@example.com', ARRAY['cycling'], 'Road cyclist.', 'Cycling', '1983-12-05', 'Male', 'Advanced', 'Rides 200km/week', 178.0, 72.0, NOW(), NOW(), NULL),
('123', 'Ivy', 'Lee', 'ivy.lee9@example.com', ARRAY['climbing'], 'Bouldering enthusiast.', 'Climbing', '1996-06-21', 'Female', 'Intermediate', 'Climbs 3x/week', 162.0, 54.0, NOW(), NOW(), NULL),
('123', 'Jack', 'Walker', 'jack.walker10@example.com', ARRAY['crossfit'], 'Crossfit regular.', 'CrossFit', '1993-08-14', 'Male', 'Intermediate', 'Crossfit 4x/week', 182.0, 80.0, NOW(), NOW(), NULL),
('123', 'Kara', 'Hall', 'kara.hall11@example.com', ARRAY['pilates'], 'Pilates instructor.', 'Pilates', '1989-02-27', 'Female', 'Advanced', 'Teaches pilates', 167.0, 57.0, NOW(), NOW(), NULL),
('123', 'Liam', 'Allen', 'liam.allen12@example.com', ARRAY['swimming'], 'Open water swimmer.', 'Swimming', '1994-10-09', 'Male', 'Intermediate', 'Swims lakes', 176.0, 68.0, NOW(), NOW(), NULL),
('123', 'Mia', 'Young', 'mia.young13@example.com', ARRAY['yoga'], 'Yoga teacher.', 'Yoga', '1990-05-19', 'Female', 'Advanced', 'Teaches vinyasa', 164.0, 56.0, NOW(), NOW(), NULL),
('123', 'Noah', 'King', 'noah.king14@example.com', ARRAY['basketball'], 'Point guard.', 'Basketball', '1986-03-23', 'Male', 'Advanced', 'Plays semi-pro', 188.0, 85.0, NOW(), NOW(), NULL),
('123', 'Olivia', 'Wright', 'olivia.wright15@example.com', ARRAY['running'], 'Trail runner.', 'Running', '1997-07-30', 'Female', 'Intermediate', 'Runs trails', 169.0, 59.0, NOW(), NOW(), NULL),
('123', 'Paul', 'Lopez', 'paul.lopez16@example.com', ARRAY['cycling'], 'Mountain biker.', 'Cycling', '1984-11-11', 'Male', 'Intermediate', 'Rides weekends', 181.0, 77.0, NOW(), NOW(), NULL),
('123', 'Quinn', 'Hill', 'quinn.hill17@example.com', ARRAY['rowing'], 'Rowing club.', 'Rowing', '1992-01-05', 'Non-binary', 'Beginner', 'New to rowing', 172.0, 65.0, NOW(), NOW(), NULL),
('123', 'Ruby', 'Scott', 'ruby.scott18@example.com', ARRAY['dance'], 'Ballet dancer.', 'Dance', '1995-09-17', 'Female', 'Advanced', 'Performs ballet', 158.0, 50.0, NOW(), NOW(), NULL),
('123', 'Sam', 'Green', 'sam.green19@example.com', ARRAY['football'], 'Quarterback.', 'Football', '1989-06-02', 'Male', 'Advanced', 'Plays in league', 190.0, 90.0, NOW(), NOW(), NULL),
('123', 'Tina', 'Baker', 'tina.baker20@example.com', ARRAY['yoga','running'], 'Yoga and running.', 'Yoga', '1993-12-25', 'Female', 'Intermediate', 'Mixes yoga and running', 166.0, 58.0, NOW(), NOW(), NULL);
`;
  }

  /**
   * Get default value for a field
   */
  private getDefaultValue(field: Field): string {
    if (field.type === 'Boolean' && !field.nullable) {
      return ' DEFAULT FALSE';
    }
    if (field.name === 'timezone') {
      return " DEFAULT 'UTC'";
    }
    if (field.name === 'accountStatus') {
      return " DEFAULT 'ACTIVE'";
    }
    if (field.name === 'subscriptionStatus') {
      return " DEFAULT 'TRIAL'";
    }
    if (field.name === 'subscriptionTier') {
      return " DEFAULT 'FREE'";
    }
    if (field.name === 'status') {
      return " DEFAULT 'ACTIVE'";
    }
    if (field.name === 'currency') {
      return " DEFAULT 'USD'";
    }
    if (field.name === 'createdAt' || field.name === 'updatedAt') {
      return ' DEFAULT CURRENT_TIMESTAMP';
    }
    return '';
  }
}

/**
 * Main execution
 */
function main() {
  try {
    console.log('🔄 Generating SQL schema from GraphQL schema...');

    // Read GraphQL schema
    const graphqlSchemaPath = join(process.cwd(), GRAPHQL_SCHEMA_PATH);
    const schemaContent = readFileSync(graphqlSchemaPath, 'utf-8');

    // Generate SQL schema
    const generator = new SQLSchemaGenerator();
    generator.parseGraphQLSchema(schemaContent);
    const sqlSchema = generator.generateSQLSchema();

    // Write SQL schema
    const sqlSchemaPath = join(process.cwd(), SQL_SCHEMA_PATH);
    writeFileSync(sqlSchemaPath, sqlSchema);

    console.log('✅ SQL schema generated successfully!');
    console.log(`📝 Output written to: ${SQL_SCHEMA_PATH}`);
    
  } catch (error) {
    console.error('❌ Error generating SQL schema:', error);
    process.exit(1);
  }
}

// Run if this script is executed directly
if (require.main === module) {
  main();
}

export { SQLSchemaGenerator };