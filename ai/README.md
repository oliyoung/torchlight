# AI Integration Layer

This directory contains the AI-powered features that enhance the wisegrowth coaching platform with intelligent insights, automated summaries, and personalized training recommendations. The AI system is designed to support coaches, trainers, and mentors in making data-driven decisions while helping athletes develop better self-reflection skills.

## Core Philosophy

The AI integration follows the platform's **human-centered coaching approach** that:
- **Augments rather than replaces** coach expertise and judgment - AI acts as a coach's assistant, not a replacement
- **Turns conversations into progress** by extracting meaningful insights from session transcripts and notes
- **Adapts to different developmental stages** - especially youth athletes who need guided reflection
- **Maintains data privacy and security** with all processing respecting athlete confidentiality
- **Provides actionable insights** rather than generic analysis
- **Scales with the coaching workflow** from individual sessions to long-term development patterns
- **Builds truly personalized development journeys** by understanding context over time

## Platform Context

**wisegrowth** is designed for coaches, trainers, and support professionals who want more than spreadsheets and sticky notes. The platform addresses the core problem of fragmented coaching systems where:
- Critical context from past conversations is lost
- Progress isn't easy to see across time
- Planning the next step takes more time than the session itself
- Coaches struggle to identify recurring patterns and potential risks
- Goal refinement and progress tracking lack structure

The AI layer transforms these challenges into opportunities by providing intelligent support for the coaching relationship.

## Four Main AI Pillars

### 1. **Session Log Summarization**
**Purpose**: Transform athlete feedback into structured, actionable coaching insights

**Location**: `features/summarizeSessionLog.ts` + `prompts/summarize_session_log.prompt.yml`

**Key Features**:
- **Youth-aware processing**: Interprets guided feedback (emoji ratings, preset options) alongside narrative input
- **Age-appropriate analysis**: Uses developmental stage to inform summary language and focus areas
- **Structured output**: Consistent format with session overview, key highlights, areas of focus, athlete mindset, and next steps
- **Multi-format input**: Handles both structured youth responses and detailed adult feedback

**Input**: Single session with transcript, coach notes, athlete feedback
**Output**: Formatted summary optimized for coach review and longitudinal tracking

### 2. **Longitudinal Pattern Analysis**
**Purpose**: Identify development trends and coaching opportunities across multiple sessions

**Location**: `features/analyzeSessionPatterns.ts` + `prompts/analyze_session_patterns.prompt.yml`

**Key Features**:
- **Trend identification**: Recognizes patterns in motivation, technical development, and goal progression
- **Coaching insights**: Provides specific recommendations for training adjustments
- **Risk detection**: Identifies concerning patterns (motivation decline, persistent challenges)
- **Youth development focus**: Considers developmental stages in pattern interpretation

**Input**: Multiple session logs within date range (leverages existing summaries)
**Output**: Comprehensive analysis with performance trends, coaching recommendations, and priority actions

### 3. **Training Plan Generation**
**Purpose**: Create personalized training programs based on athlete profiles and goals

**Location**: `features/generateTrainingPlan.ts` + `prompts/generate_training_plan.prompt.yml`

**Key Features**:
- **Athlete-specific customization**: Considers age, fitness level, training history, and current goals
- **Assistant expertise integration**: Leverages sport-specific AI personas for specialized knowledge
- **Progressive programming**: Creates age-appropriate progressions and modifications
- **Session history integration**: Builds on previous training patterns and responses

**Input**: Athlete profile, goals, assistant expertise, session history
**Output**: Detailed training plan with exercises, progressions, and coaching notes

### 4. **Goal Evaluation and Enhancement**
**Purpose**: Analyze and improve goal setting through structured evaluation

**Location**: `features/extractAndEvaluateGoal.ts` + `prompts/goal_evaluation.prompt.yml`

**Key Features**:
- **SMART goal analysis**: Evaluates specificity, measurability, achievability, relevance, and time-bound nature
- **Improvement suggestions**: Provides concrete recommendations for goal refinement
- **Athlete context integration**: Considers age, experience level, and sport-specific factors
- **Confidence assessment**: Identifies information gaps and assumptions in goal analysis

**Input**: Natural language goal descriptions, athlete context
**Output**: Comprehensive evaluation with scoring, refinement suggestions, and timeline analysis

## Architecture Overview

### Modular Design
```
ai/
├── features/           # Core AI functionality
├── prompts/           # YAML prompt templates
├── providers/         # AI provider abstractions (OpenAI, Anthropic)
└── lib/              # Shared utilities and prompt processing
```

### Prompt Management System
**Location**: `lib/promptLoader.ts`

**Key Features**:
- **YAML-based templates**: Structured prompt definitions with variable substitution
- **Version control**: All prompts tracked in git for reproducibility
- **Optimized processing**: Single function handles template loading, variable replacement, and model configuration
- **Provider abstraction**: Consistent interface across different AI providers

### Integration Points

#### GraphQL API
All AI features are exposed through GraphQL mutations:
- `summarizeSessionLog`: Process individual session feedback
- `analyzeSessionPatterns`: Analyze multiple session trends
- `generateTrainingPlan`: Create personalized training programs
- `extractAndEvaluateGoal`: Evaluate and enhance goal setting

#### Real-time Updates
AI processing integrates with the platform's PubSub system for:
- Live training plan generation status
- Session log update notifications
- Background processing coordination

## Youth Athlete Support

### Age-Appropriate Interface Components
**Location**: `../components/ui/youth-session-review.tsx`

**Features**:
- **Visual feedback system**: Emoji-based ratings for energy, enjoyment, difficulty
- **Guided reflection**: Step-by-step prompts that help athletes think through their experience
- **Preset options**: Feeling words, focus areas, and challenge categories appropriate for different ages
- **Progressive disclosure**: Complexity adjusts based on athlete's developmental stage

### Feedback Enhancement
**Location**: `features/expandYouthFeedback.ts`

**Purpose**: Generate follow-up questions when initial responses are too basic ("it was good")

**Features**:
- **Developmental awareness**: Questions tailored to elementary, middle school, or high school levels
- **Category-specific prompts**: Technical, emotional, challenge-focused questions
- **Encouraging language**: Promotes growth mindset and positive reflection
- **Coach guidance**: Helps coaches facilitate deeper athlete reflection

## Development Guidelines

### Adding New AI Features
1. **Create feature module** in `features/` with clear function interfaces
2. **Design prompt template** in `prompts/` following YAML structure
3. **Add GraphQL schema** definitions and mutations
4. **Implement mutation resolver** following existing patterns
5. **Add comprehensive logging** for monitoring and debugging

### Prompt Development Best Practices
- **Use clear variable names** that match the feature's data structure
- **Include age-appropriate considerations** for youth athlete features
- **Provide specific output format requirements** for structured responses
- **Test with various input scenarios** including edge cases
- **Document prompt reasoning** and expected behaviors

### Testing AI Features
- **Unit tests**: Test prompt processing and variable substitution
- **Integration tests**: Verify end-to-end AI workflow functionality
- **Mock responses**: Use consistent test data for predictable development
- **Performance monitoring**: Track AI response times and quality metrics

## Customer Impact

The AI features directly address coach pain points identified through user research:

> *"I used to rely on notebooks and my memory to track where athletes were at—and I always felt like I was missing something. wisegrowth gives me a clean way to capture session notes, revisit long-term goals, and even get an AI summary of the big themes. It's like having a second brain for coaching."*
> — Casey Tran, Athletic Performance Coach

### Key Benefits
- **Time savings**: Automated session summaries and planning assistance
- **Better insights**: AI extracts patterns coaches might miss
- **Improved goal setting**: Structured evaluation and refinement process
- **Youth development**: Age-appropriate tools for building self-reflection skills
- **Proactive support**: Early identification of potential risks and challenges

## Future Enhancements

### Planned Features
- **Injury risk assessment**: Pattern analysis for overtraining and injury prevention
- **Parent communication**: Age-appropriate progress summaries for youth athlete families
- **Team dynamics analysis**: Multi-athlete pattern recognition for team sports
- **Performance prediction**: Trend-based forecasting for goal achievement timelines
- **Integration support**: Calendar and live chat integrations
- **Advanced analytics**: Deeper insights across athlete populations

### Technical Improvements
- **Caching layer**: Store processed insights to reduce API calls
- **Batch processing**: Efficient handling of multiple session analysis
- **Quality metrics**: Automated assessment of AI output quality
- **A/B testing framework**: Compare prompt effectiveness and model performance
- **Model Context Protocol**: Future integration with MCP for enhanced AI capabilities

## Security and Privacy

### Data Protection
- **Athlete confidentiality**: All AI processing maintains strict privacy standards
- **Secure transmission**: API calls use encrypted connections
- **Minimal data exposure**: Only necessary information sent to AI providers
- **Access controls**: User-scoped data access with authentication requirements

### Compliance Considerations
- **Youth protection**: Special handling for athletes under 18
- **Data retention**: Configurable retention policies for AI-processed data
- **Audit trails**: Comprehensive logging of AI feature usage
- **Provider agreements**: Vendor contracts ensuring data protection compliance

---

## Getting Started

### Prerequisites
- **Environment variables**: `ANTHROPIC_API_KEY` or `OPENAI_API_KEY` configured
- **GraphQL codegen**: Run `yarn generate:watch` for type generation
- **Database access**: Supabase connection for athlete data

### Development Workflow
```bash
# Start development with AI features
yarn dev --turbopack

# Watch for GraphQL schema changes
yarn generate:watch

# Test AI prompt processing
yarn test ai/

# View AI API interactions
# Check logs at http://localhost:3000/api/graphql
```

### Example Usage
```typescript
// Summarize a session log
const summary = await summarizeSessionLog(sessionLogId, userId, pubsub);

// Analyze multiple sessions for patterns
const patterns = await analyzeSessionPatterns(athleteId, startDate, endDate, goalIds, userId);

// Generate a training plan
await generateTrainingPlanContent(planId, userId, assistantIds, athlete, goals, pubsub);
```

This AI layer transforms raw coaching data into actionable insights, making WiseGrowth a truly intelligent coaching platform that adapts to each athlete's unique development journey.