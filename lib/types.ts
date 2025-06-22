import { GraphQLResolveInfo, GraphQLScalarType, GraphQLScalarTypeConfig } from 'graphql';
import { GraphQLContext } from '@/app/api/graphql/route';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
export type RequireFields<T, K extends keyof T> = Omit<T, K> & { [P in K]-?: NonNullable<T[P]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  DateTime: { input: any; output: any; }
  JSON: { input: any; output: any; }
};

/**
 * Input for AI longitudinal pattern analysis across session logs.
 * Analyzes patterns and trends across multiple session logs to identify insights.
 */
export type AiAnalyzeSessionPatternsInput = {
  athleteId: Scalars['ID']['input'];
  endDate: Scalars['DateTime']['input'];
  goalIds?: InputMaybe<Array<Scalars['ID']['input']>>;
  startDate: Scalars['DateTime']['input'];
};

/**
 * Input for AI goal extraction and evaluation from natural language.
 * Processes goal text and provides structured evaluation and recommendations.
 */
export type AiExtractAndEvaluateGoalInput = {
  athleteId: Scalars['ID']['input'];
  goalText: Scalars['String']['input'];
};

/**
 * Input for AI training plan generation.
 * Creates suggested training plan content based on athlete goals and historical data.
 */
export type AiGenerateTrainingPlanInput = {
  athleteId: Scalars['ID']['input'];
  goalIds: Array<Scalars['ID']['input']>;
};

/**
 * Metadata tracking AI processing status for session logs.
 * Used to track which AI features have been applied to avoid duplicate processing.
 */
export type AiMetadata = {
  __typename?: 'AIMetadata';
  nextStepsGenerated: Scalars['Boolean']['output'];
  summaryGenerated: Scalars['Boolean']['output'];
};

/**
 * Input for triggering AI summarization of a session log.
 * Generates summary and action items using AI analysis of session content.
 */
export type AiSummarizeSessionLogInput = {
  sessionLogId: Scalars['ID']['input'];
};

/** Account status indicating the overall state of the coach's account. */
export enum AccountStatus {
  Active = 'ACTIVE',
  Banned = 'BANNED',
  Incomplete = 'INCOMPLETE',
  PendingVerification = 'PENDING_VERIFICATION',
  Suspended = 'SUSPENDED'
}

/**
 * AI Assistant entity representing coaching specialists for different sports and roles.
 * Assistants provide AI-powered insights and generate training content based on their expertise.
 */
export type Assistant = {
  __typename?: 'Assistant';
  bio: Scalars['String']['output'];
  createdAt: Scalars['DateTime']['output'];
  deletedAt?: Maybe<Scalars['DateTime']['output']>;
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  promptTemplate: Scalars['String']['output'];
  role: Scalars['String']['output'];
  sport: Scalars['String']['output'];
  strengths: Array<Scalars['String']['output']>;
  updatedAt: Scalars['DateTime']['output'];
};

/** Filter criteria for finding assistants based on sport, role, and expertise. */
export type AssistantsFilter = {
  role?: InputMaybe<Scalars['String']['input']>;
  sport: Scalars['String']['input'];
  strengths?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};

/** Input wrapper for assistant queries with optional filtering. */
export type AssistantsInput = {
  filter?: InputMaybe<AssistantsFilter>;
};

/**
 * Athlete entity representing individuals receiving coaching.
 * Contains personal information, physical attributes, and relationships to goals, sessions, and training plans.
 * All athlete data is automatically scoped to the authenticated coach's user account.
 */
export type Athlete = {
  __typename?: 'Athlete';
  age?: Maybe<Scalars['Int']['output']>;
  availability?: Maybe<Scalars['JSON']['output']>;
  birthday?: Maybe<Scalars['DateTime']['output']>;
  coach: Coach;
  createdAt: Scalars['DateTime']['output'];
  deletedAt?: Maybe<Scalars['DateTime']['output']>;
  email?: Maybe<Scalars['String']['output']>;
  emergencyContactName?: Maybe<Scalars['String']['output']>;
  emergencyContactPhone?: Maybe<Scalars['String']['output']>;
  firstName: Scalars['String']['output'];
  fitnessLevel?: Maybe<FitnessLevel>;
  gender?: Maybe<AthleteGender>;
  goals?: Maybe<Array<Goal>>;
  goalsSummary?: Maybe<Scalars['String']['output']>;
  height?: Maybe<Scalars['Float']['output']>;
  id: Scalars['ID']['output'];
  injuries?: Maybe<Scalars['String']['output']>;
  lastName: Scalars['String']['output'];
  medicalConditions?: Maybe<Scalars['String']['output']>;
  notes?: Maybe<Scalars['String']['output']>;
  phone?: Maybe<Scalars['String']['output']>;
  preferredTrainingTime?: Maybe<Scalars['String']['output']>;
  sessionLogs?: Maybe<Array<SessionLog>>;
  sport: Scalars['String']['output'];
  tags?: Maybe<Array<Scalars['String']['output']>>;
  trainingHistory?: Maybe<Scalars['String']['output']>;
  trainingPlans: Array<TrainingPlan>;
  updatedAt: Scalars['DateTime']['output'];
  weight?: Maybe<Scalars['Float']['output']>;
};

/** Athlete gender options for training considerations. */
export enum AthleteGender {
  Female = 'FEMALE',
  Male = 'MALE',
  NonBinary = 'NON_BINARY',
  PreferNotToSay = 'PREFER_NOT_TO_SAY'
}

/** Resource availability and practical constraints for goal achievement. */
export type Availability = {
  __typename?: 'Availability';
  budget?: Maybe<Scalars['String']['output']>;
  equipment: Array<Scalars['String']['output']>;
  location?: Maybe<Scalars['String']['output']>;
  scheduleConstraints: Array<Scalars['String']['output']>;
  trainingTime?: Maybe<Scalars['String']['output']>;
};

/**
 * Coach entity representing the authenticated user/coach who owns athletes and training data.
 * Abstracts the traditional user model and stores core profile and account information.
 * The user_id field references the Supabase auth user UUID.
 */
export type Coach = {
  __typename?: 'Coach';
  athletes: Array<Athlete>;
  avatar?: Maybe<Scalars['String']['output']>;
  billing?: Maybe<CoachBilling>;
  createdAt: Scalars['DateTime']['output'];
  deletedAt?: Maybe<Scalars['DateTime']['output']>;
  displayName?: Maybe<Scalars['String']['output']>;
  email: Scalars['String']['output'];
  firstName?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  lastLoginAt?: Maybe<Scalars['DateTime']['output']>;
  lastName?: Maybe<Scalars['String']['output']>;
  onboardingCompleted: Scalars['Boolean']['output'];
  role: CoachRole;
  timezone?: Maybe<Scalars['String']['output']>;
  trainingPlans: Array<TrainingPlan>;
  updatedAt: Scalars['DateTime']['output'];
  userId: Scalars['ID']['output'];
};

/**
 * CoachBilling entity managing subscription, billing, and usage tracking for coaches.
 * Separated from Coach entity to maintain clean separation of concerns.
 * Integrated with Stripe for payment processing and subscription management.
 */
export type CoachBilling = {
  __typename?: 'CoachBilling';
  aiCreditsRemaining?: Maybe<Scalars['Int']['output']>;
  billingCycleDay?: Maybe<Scalars['Int']['output']>;
  billingEmail?: Maybe<Scalars['String']['output']>;
  coach: Coach;
  createdAt: Scalars['DateTime']['output'];
  currency: Scalars['String']['output'];
  currentAthleteCount: Scalars['Int']['output'];
  currentSessionLogCount: Scalars['Int']['output'];
  deletedAt?: Maybe<Scalars['DateTime']['output']>;
  id: Scalars['ID']['output'];
  lastPaymentDate?: Maybe<Scalars['DateTime']['output']>;
  monthlyAthleteLimit: Scalars['Int']['output'];
  monthlySessionLogLimit: Scalars['Int']['output'];
  nextBillingDate?: Maybe<Scalars['DateTime']['output']>;
  stripeCustomerId?: Maybe<Scalars['String']['output']>;
  subscriptionEndDate?: Maybe<Scalars['DateTime']['output']>;
  subscriptionStartDate?: Maybe<Scalars['DateTime']['output']>;
  subscriptionStatus: SubscriptionStatus;
  subscriptionTier: SubscriptionTier;
  trialEndDate?: Maybe<Scalars['DateTime']['output']>;
  updatedAt: Scalars['DateTime']['output'];
  usageResetDate: Scalars['DateTime']['output'];
};

/** Coach role type determining UI mode and athlete limits. */
export enum CoachRole {
  Personal = 'PERSONAL',
  Professional = 'PROFESSIONAL',
  Self = 'SELF'
}

/** Coach-specific feedback and development insights. */
export type CoachingFeedback = {
  __typename?: 'CoachingFeedback';
  coachDevelopmentInsight: Scalars['String']['output'];
  dataQuality: DataQuality;
  improvementSuggestions: Array<Scalars['String']['output']>;
  keyGapsIdentified: Array<Scalars['String']['output']>;
  riskFlags: Array<Scalars['String']['output']>;
};

/** Confidence level in AI analysis and recommendations. */
export enum ConfidenceLevel {
  High = 'HIGH',
  Low = 'LOW',
  Medium = 'MEDIUM'
}

/** Limitations and challenges that may impact goal achievement. */
export type Constraints = {
  __typename?: 'Constraints';
  experienceLevel: ExperienceLevel;
  physicalLimitations: Array<Scalars['String']['output']>;
  previousChallenges: Array<Scalars['String']['output']>;
  riskFactors: Array<Scalars['String']['output']>;
};

/**
 * Core goal information extracted from natural language input.
 * Represents the fundamental objective and sport context.
 */
export type CoreGoal = {
  __typename?: 'CoreGoal';
  measurableOutcome?: Maybe<Scalars['String']['output']>;
  primaryObjective: Scalars['String']['output'];
  sport: Scalars['String']['output'];
  type: Scalars['String']['output'];
};

/**
 * Input for creating a new athlete record.
 * All fields are validated and the athlete is automatically associated with the authenticated coach.
 */
export type CreateAthleteInput = {
  availability?: InputMaybe<Scalars['JSON']['input']>;
  birthday: Scalars['DateTime']['input'];
  email?: InputMaybe<Scalars['String']['input']>;
  emergencyContactName?: InputMaybe<Scalars['String']['input']>;
  emergencyContactPhone?: InputMaybe<Scalars['String']['input']>;
  firstName: Scalars['String']['input'];
  fitnessLevel?: InputMaybe<FitnessLevel>;
  gender?: InputMaybe<AthleteGender>;
  goalsSummary?: InputMaybe<Scalars['String']['input']>;
  height?: InputMaybe<Scalars['Float']['input']>;
  injuries?: InputMaybe<Scalars['String']['input']>;
  lastName: Scalars['String']['input'];
  medicalConditions?: InputMaybe<Scalars['String']['input']>;
  notes?: InputMaybe<Scalars['String']['input']>;
  phone?: InputMaybe<Scalars['String']['input']>;
  preferredTrainingTime?: InputMaybe<Scalars['String']['input']>;
  sport: Scalars['String']['input'];
  tags?: InputMaybe<Array<Scalars['String']['input']>>;
  trainingHistory?: InputMaybe<Scalars['String']['input']>;
  weight?: InputMaybe<Scalars['Float']['input']>;
};

/**
 * Input for creating a new coach profile during onboarding.
 * Called automatically after successful authentication.
 */
export type CreateCoachInput = {
  billingEmail?: InputMaybe<Scalars['String']['input']>;
  displayName?: InputMaybe<Scalars['String']['input']>;
  firstName?: InputMaybe<Scalars['String']['input']>;
  lastName?: InputMaybe<Scalars['String']['input']>;
  role: CoachRole;
  timezone?: InputMaybe<Scalars['String']['input']>;
};

/**
 * Input for creating a new goal for an athlete.
 * Goals are automatically associated with the specified athlete and authenticated coach.
 */
export type CreateGoalInput = {
  athleteId: Scalars['ID']['input'];
  category: GoalCategory;
  currentValue?: InputMaybe<Scalars['Float']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  dueDate?: InputMaybe<Scalars['DateTime']['input']>;
  priority: GoalPriority;
  progressNotes?: InputMaybe<Scalars['String']['input']>;
  targetValue?: InputMaybe<Scalars['Float']['input']>;
  title: Scalars['String']['input'];
  unit?: InputMaybe<Scalars['String']['input']>;
};

/**
 * Input for creating a new session log entry.
 * Session logs capture training session details and progress toward goals.
 */
export type CreateSessionLogInput = {
  athleteFeedback?: InputMaybe<Scalars['String']['input']>;
  athleteId: Scalars['ID']['input'];
  coachRating?: InputMaybe<Scalars['Int']['input']>;
  date: Scalars['DateTime']['input'];
  durationMinutes?: InputMaybe<Scalars['Int']['input']>;
  equipmentUsed?: InputMaybe<Array<Scalars['String']['input']>>;
  exercisesPerformed?: InputMaybe<Scalars['JSON']['input']>;
  goalIds?: InputMaybe<Array<Scalars['ID']['input']>>;
  intensityLevel?: InputMaybe<SessionIntensity>;
  location?: InputMaybe<Scalars['String']['input']>;
  notes?: InputMaybe<Scalars['String']['input']>;
  sessionType: SessionType;
  transcript?: InputMaybe<Scalars['String']['input']>;
  weatherConditions?: InputMaybe<Scalars['String']['input']>;
};

/**
 * Input for creating a new training plan.
 * Plan content will be generated by AI based on specified goals and assistant expertise.
 */
export type CreateTrainingPlanInput = {
  assistantIds?: InputMaybe<Array<Scalars['ID']['input']>>;
  athleteId: Scalars['ID']['input'];
  endDate?: InputMaybe<Scalars['DateTime']['input']>;
  goalIds?: InputMaybe<Array<Scalars['ID']['input']>>;
  notes?: InputMaybe<Scalars['String']['input']>;
  overview?: InputMaybe<Scalars['String']['input']>;
  startDate?: InputMaybe<Scalars['DateTime']['input']>;
};

/** Assessment of data quality for coaching analysis. */
export enum DataQuality {
  Excellent = 'EXCELLENT',
  Good = 'GOOD',
  Insufficient = 'INSUFFICIENT',
  Limited = 'LIMITED'
}

/** Detailed breakdown of goal evaluation highlighting key areas. */
export type EvaluationSummary = {
  __typename?: 'EvaluationSummary';
  improvementPriorities: Array<Scalars['String']['output']>;
  riskFactors: Array<Scalars['String']['output']>;
  strengths: Array<Scalars['String']['output']>;
  weaknesses: Array<Scalars['String']['output']>;
};

/** Experience level classification for training planning. */
export enum ExperienceLevel {
  Advanced = 'ADVANCED',
  Beginner = 'BEGINNER',
  Intermediate = 'INTERMEDIATE',
  Returning = 'RETURNING'
}

/** AI confidence assessment and information gaps in goal analysis. */
export type ExtractionConfidence = {
  __typename?: 'ExtractionConfidence';
  assumptions: Array<Scalars['String']['output']>;
  missingInformation: Array<Scalars['String']['output']>;
  overallConfidence: ConfidenceLevel;
  suggestedQuestions: Array<Scalars['String']['output']>;
};

/** Fitness level assessment for training planning. */
export enum FitnessLevel {
  Advanced = 'ADVANCED',
  Beginner = 'BEGINNER',
  Elite = 'ELITE',
  Intermediate = 'INTERMEDIATE'
}

/**
 * Goal entity representing specific training objectives for athletes.
 * Goals can be linked to multiple session logs and training plans for comprehensive tracking.
 */
export type Goal = {
  __typename?: 'Goal';
  athlete: Athlete;
  category: GoalCategory;
  completedAt?: Maybe<Scalars['DateTime']['output']>;
  createdAt: Scalars['DateTime']['output'];
  currentValue?: Maybe<Scalars['Float']['output']>;
  deletedAt?: Maybe<Scalars['DateTime']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  dueDate?: Maybe<Scalars['DateTime']['output']>;
  evaluationResponse?: Maybe<Scalars['JSON']['output']>;
  id: Scalars['ID']['output'];
  priority: GoalPriority;
  progressNotes?: Maybe<Scalars['String']['output']>;
  progressPercentage?: Maybe<Scalars['Float']['output']>;
  sessionLogs: Array<SessionLog>;
  status: GoalStatus;
  targetValue?: Maybe<Scalars['Float']['output']>;
  title: Scalars['String']['output'];
  trainingPlans?: Maybe<Array<TrainingPlan>>;
  unit?: Maybe<Scalars['String']['output']>;
  updatedAt: Scalars['DateTime']['output'];
};

/** Goal category classification for training focus areas. */
export enum GoalCategory {
  Endurance = 'ENDURANCE',
  Flexibility = 'FLEXIBILITY',
  Mental = 'MENTAL',
  Nutrition = 'NUTRITION',
  Recovery = 'RECOVERY',
  Skill = 'SKILL',
  Speed = 'SPEED',
  Strength = 'STRENGTH',
  Technique = 'TECHNIQUE'
}

/**
 * Detailed scoring and evaluation of goal quality across multiple dimensions.
 * Each score is typically 1-10 scale with 10 being highest quality.
 */
export type GoalEvaluation = {
  __typename?: 'GoalEvaluation';
  evaluationSummary: EvaluationSummary;
  feasibilityScore: Scalars['Int']['output'];
  motivationScore: Scalars['Int']['output'];
  overallQualityScore: Scalars['Int']['output'];
  relevanceScore: Scalars['Int']['output'];
  specificityScore: Scalars['Int']['output'];
  timeStructureScore: Scalars['Int']['output'];
};

/**
 * Comprehensive response from AI goal extraction and evaluation.
 * Provides detailed analysis, scoring, and recommendations for goal refinement.
 */
export type GoalEvaluationResponse = {
  __typename?: 'GoalEvaluationResponse';
  availability: Availability;
  coachingFeedback: CoachingFeedback;
  constraints: Constraints;
  coreGoal: CoreGoal;
  extractionConfidence: ExtractionConfidence;
  goalEvaluation: GoalEvaluation;
  motivation: Motivation;
  refinedGoalSuggestion: RefinedGoalSuggestion;
  successIndicators: SuccessIndicators;
  timeline: Timeline;
};

/** Goal priority level for planning and focus. */
export enum GoalPriority {
  Critical = 'CRITICAL',
  High = 'HIGH',
  Low = 'LOW',
  Medium = 'MEDIUM'
}

/** Goal lifecycle status indicating current state and progress. */
export enum GoalStatus {
  Active = 'ACTIVE',
  Completed = 'COMPLETED',
  Paused = 'PAUSED'
}

/** Motivational factors and emotional context driving the goal. */
export type Motivation = {
  __typename?: 'Motivation';
  emotionalContext: Scalars['String']['output'];
  externalDrivers: Array<Scalars['String']['output']>;
  supportSystem: Array<Scalars['String']['output']>;
  whyItMatters: Scalars['String']['output'];
};

/**
 * Root mutation type providing write access to all platform entities.
 * All mutations are automatically scoped to the authenticated coach's data.
 * Includes both standard CRUD operations and AI-powered features.
 */
export type Mutation = {
  __typename?: 'Mutation';
  analyzeSessionPatterns: Scalars['String']['output'];
  createAthlete: Athlete;
  createCoach: Coach;
  createGoal: Goal;
  createSessionLog: SessionLog;
  createTrainingPlan: TrainingPlan;
  deleteAthlete: Scalars['Boolean']['output'];
  deleteGoal: Scalars['Boolean']['output'];
  deleteSessionLog: Scalars['Boolean']['output'];
  extractAndEvaluateGoal: GoalEvaluationResponse;
  generateTrainingPlan: TrainingPlan;
  summarizeSessionLog: SessionLog;
  updateAthlete: Athlete;
  updateCoach: Coach;
  updateCoachBilling: CoachBilling;
  updateGoal: Goal;
  updateSessionLog: SessionLog;
  updateTrainingPlan: TrainingPlan;
};


/**
 * Root mutation type providing write access to all platform entities.
 * All mutations are automatically scoped to the authenticated coach's data.
 * Includes both standard CRUD operations and AI-powered features.
 */
export type MutationAnalyzeSessionPatternsArgs = {
  input: AiAnalyzeSessionPatternsInput;
};


/**
 * Root mutation type providing write access to all platform entities.
 * All mutations are automatically scoped to the authenticated coach's data.
 * Includes both standard CRUD operations and AI-powered features.
 */
export type MutationCreateAthleteArgs = {
  input: CreateAthleteInput;
};


/**
 * Root mutation type providing write access to all platform entities.
 * All mutations are automatically scoped to the authenticated coach's data.
 * Includes both standard CRUD operations and AI-powered features.
 */
export type MutationCreateCoachArgs = {
  input: CreateCoachInput;
};


/**
 * Root mutation type providing write access to all platform entities.
 * All mutations are automatically scoped to the authenticated coach's data.
 * Includes both standard CRUD operations and AI-powered features.
 */
export type MutationCreateGoalArgs = {
  input: CreateGoalInput;
};


/**
 * Root mutation type providing write access to all platform entities.
 * All mutations are automatically scoped to the authenticated coach's data.
 * Includes both standard CRUD operations and AI-powered features.
 */
export type MutationCreateSessionLogArgs = {
  input: CreateSessionLogInput;
};


/**
 * Root mutation type providing write access to all platform entities.
 * All mutations are automatically scoped to the authenticated coach's data.
 * Includes both standard CRUD operations and AI-powered features.
 */
export type MutationCreateTrainingPlanArgs = {
  input: CreateTrainingPlanInput;
};


/**
 * Root mutation type providing write access to all platform entities.
 * All mutations are automatically scoped to the authenticated coach's data.
 * Includes both standard CRUD operations and AI-powered features.
 */
export type MutationDeleteAthleteArgs = {
  id: Scalars['ID']['input'];
};


/**
 * Root mutation type providing write access to all platform entities.
 * All mutations are automatically scoped to the authenticated coach's data.
 * Includes both standard CRUD operations and AI-powered features.
 */
export type MutationDeleteGoalArgs = {
  id: Scalars['ID']['input'];
};


/**
 * Root mutation type providing write access to all platform entities.
 * All mutations are automatically scoped to the authenticated coach's data.
 * Includes both standard CRUD operations and AI-powered features.
 */
export type MutationDeleteSessionLogArgs = {
  id: Scalars['ID']['input'];
};


/**
 * Root mutation type providing write access to all platform entities.
 * All mutations are automatically scoped to the authenticated coach's data.
 * Includes both standard CRUD operations and AI-powered features.
 */
export type MutationExtractAndEvaluateGoalArgs = {
  input: AiExtractAndEvaluateGoalInput;
};


/**
 * Root mutation type providing write access to all platform entities.
 * All mutations are automatically scoped to the authenticated coach's data.
 * Includes both standard CRUD operations and AI-powered features.
 */
export type MutationGenerateTrainingPlanArgs = {
  input: AiGenerateTrainingPlanInput;
};


/**
 * Root mutation type providing write access to all platform entities.
 * All mutations are automatically scoped to the authenticated coach's data.
 * Includes both standard CRUD operations and AI-powered features.
 */
export type MutationSummarizeSessionLogArgs = {
  input: AiSummarizeSessionLogInput;
};


/**
 * Root mutation type providing write access to all platform entities.
 * All mutations are automatically scoped to the authenticated coach's data.
 * Includes both standard CRUD operations and AI-powered features.
 */
export type MutationUpdateAthleteArgs = {
  id: Scalars['ID']['input'];
  input: UpdateAthleteInput;
};


/**
 * Root mutation type providing write access to all platform entities.
 * All mutations are automatically scoped to the authenticated coach's data.
 * Includes both standard CRUD operations and AI-powered features.
 */
export type MutationUpdateCoachArgs = {
  input: UpdateCoachInput;
};


/**
 * Root mutation type providing write access to all platform entities.
 * All mutations are automatically scoped to the authenticated coach's data.
 * Includes both standard CRUD operations and AI-powered features.
 */
export type MutationUpdateCoachBillingArgs = {
  input: UpdateCoachBillingInput;
};


/**
 * Root mutation type providing write access to all platform entities.
 * All mutations are automatically scoped to the authenticated coach's data.
 * Includes both standard CRUD operations and AI-powered features.
 */
export type MutationUpdateGoalArgs = {
  id: Scalars['ID']['input'];
  input: UpdateGoalInput;
};


/**
 * Root mutation type providing write access to all platform entities.
 * All mutations are automatically scoped to the authenticated coach's data.
 * Includes both standard CRUD operations and AI-powered features.
 */
export type MutationUpdateSessionLogArgs = {
  id: Scalars['ID']['input'];
  input: UpdateSessionLogInput;
};


/**
 * Root mutation type providing write access to all platform entities.
 * All mutations are automatically scoped to the authenticated coach's data.
 * Includes both standard CRUD operations and AI-powered features.
 */
export type MutationUpdateTrainingPlanArgs = {
  id: Scalars['ID']['input'];
  input: UpdateTrainingPlanInput;
};

/**
 * Root query type providing read access to all platform entities.
 * All queries are automatically scoped to the authenticated coach's data.
 */
export type Query = {
  __typename?: 'Query';
  assistants: Array<Maybe<Assistant>>;
  athlete?: Maybe<Athlete>;
  athletes: Array<Athlete>;
  coach?: Maybe<Coach>;
  goal?: Maybe<Goal>;
  goals: Array<Goal>;
  me?: Maybe<Coach>;
  sessionLog?: Maybe<SessionLog>;
  sessionLogs: Array<SessionLog>;
  trainingPlan?: Maybe<TrainingPlan>;
  trainingPlans: Array<TrainingPlan>;
};


/**
 * Root query type providing read access to all platform entities.
 * All queries are automatically scoped to the authenticated coach's data.
 */
export type QueryAssistantsArgs = {
  input?: InputMaybe<AssistantsInput>;
};


/**
 * Root query type providing read access to all platform entities.
 * All queries are automatically scoped to the authenticated coach's data.
 */
export type QueryAthleteArgs = {
  id: Scalars['ID']['input'];
};


/**
 * Root query type providing read access to all platform entities.
 * All queries are automatically scoped to the authenticated coach's data.
 */
export type QueryCoachArgs = {
  id: Scalars['ID']['input'];
};


/**
 * Root query type providing read access to all platform entities.
 * All queries are automatically scoped to the authenticated coach's data.
 */
export type QueryGoalArgs = {
  id: Scalars['ID']['input'];
};


/**
 * Root query type providing read access to all platform entities.
 * All queries are automatically scoped to the authenticated coach's data.
 */
export type QueryGoalsArgs = {
  athleteId?: InputMaybe<Scalars['ID']['input']>;
};


/**
 * Root query type providing read access to all platform entities.
 * All queries are automatically scoped to the authenticated coach's data.
 */
export type QuerySessionLogArgs = {
  id: Scalars['ID']['input'];
};


/**
 * Root query type providing read access to all platform entities.
 * All queries are automatically scoped to the authenticated coach's data.
 */
export type QuerySessionLogsArgs = {
  athleteId?: InputMaybe<Scalars['ID']['input']>;
};


/**
 * Root query type providing read access to all platform entities.
 * All queries are automatically scoped to the authenticated coach's data.
 */
export type QueryTrainingPlanArgs = {
  id: Scalars['ID']['input'];
};


/**
 * Root query type providing read access to all platform entities.
 * All queries are automatically scoped to the authenticated coach's data.
 */
export type QueryTrainingPlansArgs = {
  athleteId?: InputMaybe<Scalars['ID']['input']>;
};

/** AI-generated suggestions for improving the goal statement. */
export type RefinedGoalSuggestion = {
  __typename?: 'RefinedGoalSuggestion';
  improvedGoalStatement?: Maybe<Scalars['String']['output']>;
  keyChanges: Array<Scalars['String']['output']>;
  rationale: Scalars['String']['output'];
};

/** Session intensity level for tracking training load. */
export enum SessionIntensity {
  High = 'HIGH',
  Low = 'LOW',
  Moderate = 'MODERATE',
  VeryHigh = 'VERY_HIGH',
  VeryLow = 'VERY_LOW'
}

/**
 * SessionLog entity representing individual training session records.
 * Captures session details, progress notes, and AI-generated insights.
 * Note: Called "SessionLog" instead of "Session" to avoid confusion with authentication sessions.
 */
export type SessionLog = {
  __typename?: 'SessionLog';
  actionItems?: Maybe<Array<Scalars['String']['output']>>;
  aiMetadata?: Maybe<AiMetadata>;
  athlete: Athlete;
  athleteFeedback?: Maybe<Scalars['String']['output']>;
  coachRating?: Maybe<Scalars['Int']['output']>;
  createdAt: Scalars['DateTime']['output'];
  date: Scalars['DateTime']['output'];
  deletedAt?: Maybe<Scalars['DateTime']['output']>;
  durationMinutes?: Maybe<Scalars['Int']['output']>;
  equipmentUsed?: Maybe<Array<Scalars['String']['output']>>;
  exercisesPerformed?: Maybe<Scalars['JSON']['output']>;
  goals: Array<Goal>;
  id: Scalars['ID']['output'];
  intensityLevel?: Maybe<SessionIntensity>;
  location?: Maybe<Scalars['String']['output']>;
  notes?: Maybe<Scalars['String']['output']>;
  sessionType: SessionType;
  summary?: Maybe<Scalars['String']['output']>;
  transcript?: Maybe<Scalars['String']['output']>;
  updatedAt: Scalars['DateTime']['output'];
  weatherConditions?: Maybe<Scalars['String']['output']>;
};

/** Session type classification for different kinds of training sessions. */
export enum SessionType {
  Assessment = 'ASSESSMENT',
  Competition = 'COMPETITION',
  Consultation = 'CONSULTATION',
  Planning = 'PLANNING',
  Recovery = 'RECOVERY',
  Training = 'TRAINING'
}

/**
 * Root subscription type providing real-time updates for platform entities.
 * Subscriptions enable live updates in the UI during AI processing and data changes.
 * All subscriptions are automatically scoped to the authenticated coach's data.
 */
export type Subscription = {
  __typename?: 'Subscription';
  athleteUpdated: Athlete;
  goalAdded: Goal;
  goalUpdated: Goal;
  sessionLogAdded: SessionLog;
  sessionLogUpdated: SessionLog;
  trainingPlanGenerated: TrainingPlan;
};


/**
 * Root subscription type providing real-time updates for platform entities.
 * Subscriptions enable live updates in the UI during AI processing and data changes.
 * All subscriptions are automatically scoped to the authenticated coach's data.
 */
export type SubscriptionAthleteUpdatedArgs = {
  id: Scalars['ID']['input'];
};


/**
 * Root subscription type providing real-time updates for platform entities.
 * Subscriptions enable live updates in the UI during AI processing and data changes.
 * All subscriptions are automatically scoped to the authenticated coach's data.
 */
export type SubscriptionGoalAddedArgs = {
  athleteId: Scalars['ID']['input'];
};


/**
 * Root subscription type providing real-time updates for platform entities.
 * Subscriptions enable live updates in the UI during AI processing and data changes.
 * All subscriptions are automatically scoped to the authenticated coach's data.
 */
export type SubscriptionGoalUpdatedArgs = {
  id: Scalars['ID']['input'];
};


/**
 * Root subscription type providing real-time updates for platform entities.
 * Subscriptions enable live updates in the UI during AI processing and data changes.
 * All subscriptions are automatically scoped to the authenticated coach's data.
 */
export type SubscriptionSessionLogAddedArgs = {
  athleteId: Scalars['ID']['input'];
};


/**
 * Root subscription type providing real-time updates for platform entities.
 * Subscriptions enable live updates in the UI during AI processing and data changes.
 * All subscriptions are automatically scoped to the authenticated coach's data.
 */
export type SubscriptionSessionLogUpdatedArgs = {
  id: Scalars['ID']['input'];
};


/**
 * Root subscription type providing real-time updates for platform entities.
 * Subscriptions enable live updates in the UI during AI processing and data changes.
 * All subscriptions are automatically scoped to the authenticated coach's data.
 */
export type SubscriptionTrainingPlanGeneratedArgs = {
  athleteId: Scalars['ID']['input'];
};

/** Subscription status indicating the current state of the coach's billing subscription. */
export enum SubscriptionStatus {
  Active = 'ACTIVE',
  Canceled = 'CANCELED',
  Incomplete = 'INCOMPLETE',
  IncompleteExpired = 'INCOMPLETE_EXPIRED',
  PastDue = 'PAST_DUE',
  Paused = 'PAUSED',
  Trial = 'TRIAL',
  Unpaid = 'UNPAID'
}

/** Subscription tier indicating the coach's current plan level and feature access. */
export enum SubscriptionTier {
  Free = 'FREE',
  Professional = 'PROFESSIONAL',
  Starter = 'STARTER'
}

/** Success measurement criteria and expected outcomes. */
export type SuccessIndicators = {
  __typename?: 'SuccessIndicators';
  measurementMethods: Array<Scalars['String']['output']>;
  secondaryBenefits: Array<Scalars['String']['output']>;
  successDefinition: Scalars['String']['output'];
};

/** Timeline analysis and planning information for the goal. */
export type Timeline = {
  __typename?: 'Timeline';
  duration?: Maybe<Scalars['String']['output']>;
  milestones: Array<Scalars['String']['output']>;
  targetDate?: Maybe<Scalars['String']['output']>;
  urgencyLevel: UrgencyLevel;
};

/**
 * TrainingPlan entity representing structured, AI-generated training programs for athletes.
 * Plans are created by AI assistants based on specific goals and can include detailed schedules,
 * exercises, and progression tracking. Plans support real-time generation status updates.
 */
export type TrainingPlan = {
  __typename?: 'TrainingPlan';
  assistants?: Maybe<Array<Assistant>>;
  athlete: Athlete;
  completionPercentage?: Maybe<Scalars['Float']['output']>;
  createdAt: Scalars['DateTime']['output'];
  deletedAt?: Maybe<Scalars['DateTime']['output']>;
  difficulty: TrainingPlanDifficulty;
  durationWeeks?: Maybe<Scalars['Int']['output']>;
  endDate?: Maybe<Scalars['DateTime']['output']>;
  generatedBy?: Maybe<Scalars['String']['output']>;
  generationMetadata?: Maybe<Scalars['JSON']['output']>;
  goals?: Maybe<Array<Goal>>;
  id: Scalars['ID']['output'];
  notes?: Maybe<Scalars['String']['output']>;
  overview?: Maybe<Scalars['String']['output']>;
  planJson?: Maybe<Scalars['JSON']['output']>;
  sourcePrompt?: Maybe<Scalars['String']['output']>;
  startDate?: Maybe<Scalars['DateTime']['output']>;
  status: TrainingPlanStatus;
  updatedAt: Scalars['DateTime']['output'];
};

/** Training plan difficulty level for appropriate challenge setting. */
export enum TrainingPlanDifficulty {
  Advanced = 'ADVANCED',
  Beginner = 'BEGINNER',
  Elite = 'ELITE',
  Intermediate = 'INTERMEDIATE'
}

/**
 * Training plan lifecycle status indicating generation progress and readiness.
 * Used for real-time updates during AI generation process.
 */
export enum TrainingPlanStatus {
  Draft = 'DRAFT',
  Error = 'ERROR',
  Generated = 'GENERATED',
  Generating = 'GENERATING'
}

/**
 * Input for updating an existing athlete record.
 * All fields are optional - only provided fields will be updated.
 */
export type UpdateAthleteInput = {
  availability?: InputMaybe<Scalars['JSON']['input']>;
  birthday?: InputMaybe<Scalars['DateTime']['input']>;
  email?: InputMaybe<Scalars['String']['input']>;
  emergencyContactName?: InputMaybe<Scalars['String']['input']>;
  emergencyContactPhone?: InputMaybe<Scalars['String']['input']>;
  firstName?: InputMaybe<Scalars['String']['input']>;
  fitnessLevel?: InputMaybe<FitnessLevel>;
  gender?: InputMaybe<AthleteGender>;
  goalsSummary?: InputMaybe<Scalars['String']['input']>;
  height?: InputMaybe<Scalars['Float']['input']>;
  injuries?: InputMaybe<Scalars['String']['input']>;
  lastName?: InputMaybe<Scalars['String']['input']>;
  medicalConditions?: InputMaybe<Scalars['String']['input']>;
  notes?: InputMaybe<Scalars['String']['input']>;
  phone?: InputMaybe<Scalars['String']['input']>;
  preferredTrainingTime?: InputMaybe<Scalars['String']['input']>;
  sport?: InputMaybe<Scalars['String']['input']>;
  tags?: InputMaybe<Array<Scalars['String']['input']>>;
  trainingHistory?: InputMaybe<Scalars['String']['input']>;
  weight?: InputMaybe<Scalars['Float']['input']>;
};

/**
 * Input for updating coach billing information.
 * Typically called by Stripe webhooks or billing management system.
 */
export type UpdateCoachBillingInput = {
  aiCreditsRemaining?: InputMaybe<Scalars['Int']['input']>;
  billingCycleDay?: InputMaybe<Scalars['Int']['input']>;
  billingEmail?: InputMaybe<Scalars['String']['input']>;
  currency?: InputMaybe<Scalars['String']['input']>;
  lastPaymentDate?: InputMaybe<Scalars['DateTime']['input']>;
  monthlyAthleteLimit?: InputMaybe<Scalars['Int']['input']>;
  monthlySessionLogLimit?: InputMaybe<Scalars['Int']['input']>;
  nextBillingDate?: InputMaybe<Scalars['DateTime']['input']>;
  stripeCustomerId?: InputMaybe<Scalars['String']['input']>;
  subscriptionEndDate?: InputMaybe<Scalars['DateTime']['input']>;
  subscriptionStartDate?: InputMaybe<Scalars['DateTime']['input']>;
  subscriptionStatus?: InputMaybe<SubscriptionStatus>;
  subscriptionTier?: InputMaybe<SubscriptionTier>;
  trialEndDate?: InputMaybe<Scalars['DateTime']['input']>;
};

/**
 * Input for updating coach profile information.
 * All fields are optional - only provided fields will be updated.
 */
export type UpdateCoachInput = {
  avatar?: InputMaybe<Scalars['String']['input']>;
  displayName?: InputMaybe<Scalars['String']['input']>;
  firstName?: InputMaybe<Scalars['String']['input']>;
  lastName?: InputMaybe<Scalars['String']['input']>;
  onboardingCompleted?: InputMaybe<Scalars['Boolean']['input']>;
  role?: InputMaybe<CoachRole>;
  timezone?: InputMaybe<Scalars['String']['input']>;
};

/**
 * Input for updating an existing goal.
 * All fields are optional - only provided fields will be updated.
 */
export type UpdateGoalInput = {
  category?: InputMaybe<GoalCategory>;
  completedAt?: InputMaybe<Scalars['DateTime']['input']>;
  currentValue?: InputMaybe<Scalars['Float']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  dueDate?: InputMaybe<Scalars['DateTime']['input']>;
  priority?: InputMaybe<GoalPriority>;
  progressNotes?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<GoalStatus>;
  targetValue?: InputMaybe<Scalars['Float']['input']>;
  title?: InputMaybe<Scalars['String']['input']>;
  trainingPlanIds?: InputMaybe<Array<Scalars['ID']['input']>>;
  unit?: InputMaybe<Scalars['String']['input']>;
};

/**
 * Input for updating an existing session log.
 * Supports both manual updates and AI-generated content addition.
 */
export type UpdateSessionLogInput = {
  actionItems?: InputMaybe<Array<Scalars['String']['input']>>;
  athleteFeedback?: InputMaybe<Scalars['String']['input']>;
  coachRating?: InputMaybe<Scalars['Int']['input']>;
  date?: InputMaybe<Scalars['DateTime']['input']>;
  durationMinutes?: InputMaybe<Scalars['Int']['input']>;
  equipmentUsed?: InputMaybe<Array<Scalars['String']['input']>>;
  exercisesPerformed?: InputMaybe<Scalars['JSON']['input']>;
  goalIds?: InputMaybe<Array<Scalars['ID']['input']>>;
  intensityLevel?: InputMaybe<SessionIntensity>;
  location?: InputMaybe<Scalars['String']['input']>;
  notes?: InputMaybe<Scalars['String']['input']>;
  sessionType?: InputMaybe<SessionType>;
  summary?: InputMaybe<Scalars['String']['input']>;
  transcript?: InputMaybe<Scalars['String']['input']>;
  weatherConditions?: InputMaybe<Scalars['String']['input']>;
};

/**
 * Input for updating an existing training plan.
 * All fields are optional - only provided fields will be updated.
 */
export type UpdateTrainingPlanInput = {
  assistantIds?: InputMaybe<Array<Scalars['ID']['input']>>;
  completionPercentage?: InputMaybe<Scalars['Float']['input']>;
  difficulty?: InputMaybe<TrainingPlanDifficulty>;
  endDate?: InputMaybe<Scalars['DateTime']['input']>;
  goalIds?: InputMaybe<Array<Scalars['ID']['input']>>;
  notes?: InputMaybe<Scalars['String']['input']>;
  overview?: InputMaybe<Scalars['String']['input']>;
  planJson?: InputMaybe<Scalars['JSON']['input']>;
  startDate?: InputMaybe<Scalars['DateTime']['input']>;
  status?: InputMaybe<TrainingPlanStatus>;
};

/** Urgency classification for goal timeline planning. */
export enum UrgencyLevel {
  Immediate = 'IMMEDIATE',
  LongTerm = 'LONG_TERM',
  MediumTerm = 'MEDIUM_TERM',
  ShortTerm = 'SHORT_TERM'
}



export type ResolverTypeWrapper<T> = Promise<T> | T;


export type ResolverWithResolve<TResult, TParent, TContext, TArgs> = {
  resolve: ResolverFn<TResult, TParent, TContext, TArgs>;
};
export type Resolver<TResult, TParent = {}, TContext = {}, TArgs = {}> = ResolverFn<TResult, TParent, TContext, TArgs> | ResolverWithResolve<TResult, TParent, TContext, TArgs>;

export type ResolverFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => Promise<TResult> | TResult;

export type SubscriptionSubscribeFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => AsyncIterable<TResult> | Promise<AsyncIterable<TResult>>;

export type SubscriptionResolveFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

export interface SubscriptionSubscriberObject<TResult, TKey extends string, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<{ [key in TKey]: TResult }, TParent, TContext, TArgs>;
  resolve?: SubscriptionResolveFn<TResult, { [key in TKey]: TResult }, TContext, TArgs>;
}

export interface SubscriptionResolverObject<TResult, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<any, TParent, TContext, TArgs>;
  resolve: SubscriptionResolveFn<TResult, any, TContext, TArgs>;
}

export type SubscriptionObject<TResult, TKey extends string, TParent, TContext, TArgs> =
  | SubscriptionSubscriberObject<TResult, TKey, TParent, TContext, TArgs>
  | SubscriptionResolverObject<TResult, TParent, TContext, TArgs>;

export type SubscriptionResolver<TResult, TKey extends string, TParent = {}, TContext = {}, TArgs = {}> =
  | ((...args: any[]) => SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>)
  | SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>;

export type TypeResolveFn<TTypes, TParent = {}, TContext = {}> = (
  parent: TParent,
  context: TContext,
  info: GraphQLResolveInfo
) => Maybe<TTypes> | Promise<Maybe<TTypes>>;

export type IsTypeOfResolverFn<T = {}, TContext = {}> = (obj: T, context: TContext, info: GraphQLResolveInfo) => boolean | Promise<boolean>;

export type NextResolverFn<T> = () => Promise<T>;

export type DirectiveResolverFn<TResult = {}, TParent = {}, TContext = {}, TArgs = {}> = (
  next: NextResolverFn<TResult>,
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;



/** Mapping between all available schema types and the resolvers types */
export type ResolversTypes = {
  AIAnalyzeSessionPatternsInput: AiAnalyzeSessionPatternsInput;
  AIExtractAndEvaluateGoalInput: AiExtractAndEvaluateGoalInput;
  AIGenerateTrainingPlanInput: AiGenerateTrainingPlanInput;
  AIMetadata: ResolverTypeWrapper<AiMetadata>;
  AISummarizeSessionLogInput: AiSummarizeSessionLogInput;
  AccountStatus: AccountStatus;
  Assistant: ResolverTypeWrapper<Assistant>;
  AssistantsFilter: AssistantsFilter;
  AssistantsInput: AssistantsInput;
  Athlete: ResolverTypeWrapper<Athlete>;
  AthleteGender: AthleteGender;
  Availability: ResolverTypeWrapper<Availability>;
  Boolean: ResolverTypeWrapper<Scalars['Boolean']['output']>;
  Coach: ResolverTypeWrapper<Coach>;
  CoachBilling: ResolverTypeWrapper<CoachBilling>;
  CoachRole: CoachRole;
  CoachingFeedback: ResolverTypeWrapper<CoachingFeedback>;
  ConfidenceLevel: ConfidenceLevel;
  Constraints: ResolverTypeWrapper<Constraints>;
  CoreGoal: ResolverTypeWrapper<CoreGoal>;
  CreateAthleteInput: CreateAthleteInput;
  CreateCoachInput: CreateCoachInput;
  CreateGoalInput: CreateGoalInput;
  CreateSessionLogInput: CreateSessionLogInput;
  CreateTrainingPlanInput: CreateTrainingPlanInput;
  DataQuality: DataQuality;
  DateTime: ResolverTypeWrapper<Scalars['DateTime']['output']>;
  EvaluationSummary: ResolverTypeWrapper<EvaluationSummary>;
  ExperienceLevel: ExperienceLevel;
  ExtractionConfidence: ResolverTypeWrapper<ExtractionConfidence>;
  FitnessLevel: FitnessLevel;
  Float: ResolverTypeWrapper<Scalars['Float']['output']>;
  Goal: ResolverTypeWrapper<Goal>;
  GoalCategory: GoalCategory;
  GoalEvaluation: ResolverTypeWrapper<GoalEvaluation>;
  GoalEvaluationResponse: ResolverTypeWrapper<GoalEvaluationResponse>;
  GoalPriority: GoalPriority;
  GoalStatus: GoalStatus;
  ID: ResolverTypeWrapper<Scalars['ID']['output']>;
  Int: ResolverTypeWrapper<Scalars['Int']['output']>;
  JSON: ResolverTypeWrapper<Scalars['JSON']['output']>;
  Motivation: ResolverTypeWrapper<Motivation>;
  Mutation: ResolverTypeWrapper<{}>;
  Query: ResolverTypeWrapper<{}>;
  RefinedGoalSuggestion: ResolverTypeWrapper<RefinedGoalSuggestion>;
  SessionIntensity: SessionIntensity;
  SessionLog: ResolverTypeWrapper<SessionLog>;
  SessionType: SessionType;
  String: ResolverTypeWrapper<Scalars['String']['output']>;
  Subscription: ResolverTypeWrapper<{}>;
  SubscriptionStatus: SubscriptionStatus;
  SubscriptionTier: SubscriptionTier;
  SuccessIndicators: ResolverTypeWrapper<SuccessIndicators>;
  Timeline: ResolverTypeWrapper<Timeline>;
  TrainingPlan: ResolverTypeWrapper<TrainingPlan>;
  TrainingPlanDifficulty: TrainingPlanDifficulty;
  TrainingPlanStatus: TrainingPlanStatus;
  UpdateAthleteInput: UpdateAthleteInput;
  UpdateCoachBillingInput: UpdateCoachBillingInput;
  UpdateCoachInput: UpdateCoachInput;
  UpdateGoalInput: UpdateGoalInput;
  UpdateSessionLogInput: UpdateSessionLogInput;
  UpdateTrainingPlanInput: UpdateTrainingPlanInput;
  UrgencyLevel: UrgencyLevel;
};

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = {
  AIAnalyzeSessionPatternsInput: AiAnalyzeSessionPatternsInput;
  AIExtractAndEvaluateGoalInput: AiExtractAndEvaluateGoalInput;
  AIGenerateTrainingPlanInput: AiGenerateTrainingPlanInput;
  AIMetadata: AiMetadata;
  AISummarizeSessionLogInput: AiSummarizeSessionLogInput;
  Assistant: Assistant;
  AssistantsFilter: AssistantsFilter;
  AssistantsInput: AssistantsInput;
  Athlete: Athlete;
  Availability: Availability;
  Boolean: Scalars['Boolean']['output'];
  Coach: Coach;
  CoachBilling: CoachBilling;
  CoachingFeedback: CoachingFeedback;
  Constraints: Constraints;
  CoreGoal: CoreGoal;
  CreateAthleteInput: CreateAthleteInput;
  CreateCoachInput: CreateCoachInput;
  CreateGoalInput: CreateGoalInput;
  CreateSessionLogInput: CreateSessionLogInput;
  CreateTrainingPlanInput: CreateTrainingPlanInput;
  DateTime: Scalars['DateTime']['output'];
  EvaluationSummary: EvaluationSummary;
  ExtractionConfidence: ExtractionConfidence;
  Float: Scalars['Float']['output'];
  Goal: Goal;
  GoalEvaluation: GoalEvaluation;
  GoalEvaluationResponse: GoalEvaluationResponse;
  ID: Scalars['ID']['output'];
  Int: Scalars['Int']['output'];
  JSON: Scalars['JSON']['output'];
  Motivation: Motivation;
  Mutation: {};
  Query: {};
  RefinedGoalSuggestion: RefinedGoalSuggestion;
  SessionLog: SessionLog;
  String: Scalars['String']['output'];
  Subscription: {};
  SuccessIndicators: SuccessIndicators;
  Timeline: Timeline;
  TrainingPlan: TrainingPlan;
  UpdateAthleteInput: UpdateAthleteInput;
  UpdateCoachBillingInput: UpdateCoachBillingInput;
  UpdateCoachInput: UpdateCoachInput;
  UpdateGoalInput: UpdateGoalInput;
  UpdateSessionLogInput: UpdateSessionLogInput;
  UpdateTrainingPlanInput: UpdateTrainingPlanInput;
};

export type AiMetadataResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['AIMetadata'] = ResolversParentTypes['AIMetadata']> = {
  nextStepsGenerated?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  summaryGenerated?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type AssistantResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['Assistant'] = ResolversParentTypes['Assistant']> = {
  bio?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  deletedAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  promptTemplate?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  role?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  sport?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  strengths?: Resolver<Array<ResolversTypes['String']>, ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type AthleteResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['Athlete'] = ResolversParentTypes['Athlete']> = {
  age?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  availability?: Resolver<Maybe<ResolversTypes['JSON']>, ParentType, ContextType>;
  birthday?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  coach?: Resolver<ResolversTypes['Coach'], ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  deletedAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  email?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  emergencyContactName?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  emergencyContactPhone?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  firstName?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  fitnessLevel?: Resolver<Maybe<ResolversTypes['FitnessLevel']>, ParentType, ContextType>;
  gender?: Resolver<Maybe<ResolversTypes['AthleteGender']>, ParentType, ContextType>;
  goals?: Resolver<Maybe<Array<ResolversTypes['Goal']>>, ParentType, ContextType>;
  goalsSummary?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  height?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  injuries?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  lastName?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  medicalConditions?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  notes?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  phone?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  preferredTrainingTime?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  sessionLogs?: Resolver<Maybe<Array<ResolversTypes['SessionLog']>>, ParentType, ContextType>;
  sport?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  tags?: Resolver<Maybe<Array<ResolversTypes['String']>>, ParentType, ContextType>;
  trainingHistory?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  trainingPlans?: Resolver<Array<ResolversTypes['TrainingPlan']>, ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  weight?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type AvailabilityResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['Availability'] = ResolversParentTypes['Availability']> = {
  budget?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  equipment?: Resolver<Array<ResolversTypes['String']>, ParentType, ContextType>;
  location?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  scheduleConstraints?: Resolver<Array<ResolversTypes['String']>, ParentType, ContextType>;
  trainingTime?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type CoachResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['Coach'] = ResolversParentTypes['Coach']> = {
  athletes?: Resolver<Array<ResolversTypes['Athlete']>, ParentType, ContextType>;
  avatar?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  billing?: Resolver<Maybe<ResolversTypes['CoachBilling']>, ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  deletedAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  displayName?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  email?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  firstName?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  lastLoginAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  lastName?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  onboardingCompleted?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  role?: Resolver<ResolversTypes['CoachRole'], ParentType, ContextType>;
  timezone?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  trainingPlans?: Resolver<Array<ResolversTypes['TrainingPlan']>, ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  userId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type CoachBillingResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['CoachBilling'] = ResolversParentTypes['CoachBilling']> = {
  aiCreditsRemaining?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  billingCycleDay?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  billingEmail?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  coach?: Resolver<ResolversTypes['Coach'], ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  currency?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  currentAthleteCount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  currentSessionLogCount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  deletedAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  lastPaymentDate?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  monthlyAthleteLimit?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  monthlySessionLogLimit?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  nextBillingDate?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  stripeCustomerId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  subscriptionEndDate?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  subscriptionStartDate?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  subscriptionStatus?: Resolver<ResolversTypes['SubscriptionStatus'], ParentType, ContextType>;
  subscriptionTier?: Resolver<ResolversTypes['SubscriptionTier'], ParentType, ContextType>;
  trialEndDate?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  usageResetDate?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type CoachingFeedbackResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['CoachingFeedback'] = ResolversParentTypes['CoachingFeedback']> = {
  coachDevelopmentInsight?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  dataQuality?: Resolver<ResolversTypes['DataQuality'], ParentType, ContextType>;
  improvementSuggestions?: Resolver<Array<ResolversTypes['String']>, ParentType, ContextType>;
  keyGapsIdentified?: Resolver<Array<ResolversTypes['String']>, ParentType, ContextType>;
  riskFlags?: Resolver<Array<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type ConstraintsResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['Constraints'] = ResolversParentTypes['Constraints']> = {
  experienceLevel?: Resolver<ResolversTypes['ExperienceLevel'], ParentType, ContextType>;
  physicalLimitations?: Resolver<Array<ResolversTypes['String']>, ParentType, ContextType>;
  previousChallenges?: Resolver<Array<ResolversTypes['String']>, ParentType, ContextType>;
  riskFactors?: Resolver<Array<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type CoreGoalResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['CoreGoal'] = ResolversParentTypes['CoreGoal']> = {
  measurableOutcome?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  primaryObjective?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  sport?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  type?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export interface DateTimeScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['DateTime'], any> {
  name: 'DateTime';
}

export type EvaluationSummaryResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['EvaluationSummary'] = ResolversParentTypes['EvaluationSummary']> = {
  improvementPriorities?: Resolver<Array<ResolversTypes['String']>, ParentType, ContextType>;
  riskFactors?: Resolver<Array<ResolversTypes['String']>, ParentType, ContextType>;
  strengths?: Resolver<Array<ResolversTypes['String']>, ParentType, ContextType>;
  weaknesses?: Resolver<Array<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type ExtractionConfidenceResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['ExtractionConfidence'] = ResolversParentTypes['ExtractionConfidence']> = {
  assumptions?: Resolver<Array<ResolversTypes['String']>, ParentType, ContextType>;
  missingInformation?: Resolver<Array<ResolversTypes['String']>, ParentType, ContextType>;
  overallConfidence?: Resolver<ResolversTypes['ConfidenceLevel'], ParentType, ContextType>;
  suggestedQuestions?: Resolver<Array<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type GoalResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['Goal'] = ResolversParentTypes['Goal']> = {
  athlete?: Resolver<ResolversTypes['Athlete'], ParentType, ContextType>;
  category?: Resolver<ResolversTypes['GoalCategory'], ParentType, ContextType>;
  completedAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  currentValue?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  deletedAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  description?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  dueDate?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  evaluationResponse?: Resolver<Maybe<ResolversTypes['JSON']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  priority?: Resolver<ResolversTypes['GoalPriority'], ParentType, ContextType>;
  progressNotes?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  progressPercentage?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  sessionLogs?: Resolver<Array<ResolversTypes['SessionLog']>, ParentType, ContextType>;
  status?: Resolver<ResolversTypes['GoalStatus'], ParentType, ContextType>;
  targetValue?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  title?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  trainingPlans?: Resolver<Maybe<Array<ResolversTypes['TrainingPlan']>>, ParentType, ContextType>;
  unit?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type GoalEvaluationResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['GoalEvaluation'] = ResolversParentTypes['GoalEvaluation']> = {
  evaluationSummary?: Resolver<ResolversTypes['EvaluationSummary'], ParentType, ContextType>;
  feasibilityScore?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  motivationScore?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  overallQualityScore?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  relevanceScore?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  specificityScore?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  timeStructureScore?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type GoalEvaluationResponseResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['GoalEvaluationResponse'] = ResolversParentTypes['GoalEvaluationResponse']> = {
  availability?: Resolver<ResolversTypes['Availability'], ParentType, ContextType>;
  coachingFeedback?: Resolver<ResolversTypes['CoachingFeedback'], ParentType, ContextType>;
  constraints?: Resolver<ResolversTypes['Constraints'], ParentType, ContextType>;
  coreGoal?: Resolver<ResolversTypes['CoreGoal'], ParentType, ContextType>;
  extractionConfidence?: Resolver<ResolversTypes['ExtractionConfidence'], ParentType, ContextType>;
  goalEvaluation?: Resolver<ResolversTypes['GoalEvaluation'], ParentType, ContextType>;
  motivation?: Resolver<ResolversTypes['Motivation'], ParentType, ContextType>;
  refinedGoalSuggestion?: Resolver<ResolversTypes['RefinedGoalSuggestion'], ParentType, ContextType>;
  successIndicators?: Resolver<ResolversTypes['SuccessIndicators'], ParentType, ContextType>;
  timeline?: Resolver<ResolversTypes['Timeline'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export interface JsonScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['JSON'], any> {
  name: 'JSON';
}

export type MotivationResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['Motivation'] = ResolversParentTypes['Motivation']> = {
  emotionalContext?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  externalDrivers?: Resolver<Array<ResolversTypes['String']>, ParentType, ContextType>;
  supportSystem?: Resolver<Array<ResolversTypes['String']>, ParentType, ContextType>;
  whyItMatters?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type MutationResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['Mutation'] = ResolversParentTypes['Mutation']> = {
  analyzeSessionPatterns?: Resolver<ResolversTypes['String'], ParentType, ContextType, RequireFields<MutationAnalyzeSessionPatternsArgs, 'input'>>;
  createAthlete?: Resolver<ResolversTypes['Athlete'], ParentType, ContextType, RequireFields<MutationCreateAthleteArgs, 'input'>>;
  createCoach?: Resolver<ResolversTypes['Coach'], ParentType, ContextType, RequireFields<MutationCreateCoachArgs, 'input'>>;
  createGoal?: Resolver<ResolversTypes['Goal'], ParentType, ContextType, RequireFields<MutationCreateGoalArgs, 'input'>>;
  createSessionLog?: Resolver<ResolversTypes['SessionLog'], ParentType, ContextType, RequireFields<MutationCreateSessionLogArgs, 'input'>>;
  createTrainingPlan?: Resolver<ResolversTypes['TrainingPlan'], ParentType, ContextType, RequireFields<MutationCreateTrainingPlanArgs, 'input'>>;
  deleteAthlete?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType, RequireFields<MutationDeleteAthleteArgs, 'id'>>;
  deleteGoal?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType, RequireFields<MutationDeleteGoalArgs, 'id'>>;
  deleteSessionLog?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType, RequireFields<MutationDeleteSessionLogArgs, 'id'>>;
  extractAndEvaluateGoal?: Resolver<ResolversTypes['GoalEvaluationResponse'], ParentType, ContextType, RequireFields<MutationExtractAndEvaluateGoalArgs, 'input'>>;
  generateTrainingPlan?: Resolver<ResolversTypes['TrainingPlan'], ParentType, ContextType, RequireFields<MutationGenerateTrainingPlanArgs, 'input'>>;
  summarizeSessionLog?: Resolver<ResolversTypes['SessionLog'], ParentType, ContextType, RequireFields<MutationSummarizeSessionLogArgs, 'input'>>;
  updateAthlete?: Resolver<ResolversTypes['Athlete'], ParentType, ContextType, RequireFields<MutationUpdateAthleteArgs, 'id' | 'input'>>;
  updateCoach?: Resolver<ResolversTypes['Coach'], ParentType, ContextType, RequireFields<MutationUpdateCoachArgs, 'input'>>;
  updateCoachBilling?: Resolver<ResolversTypes['CoachBilling'], ParentType, ContextType, RequireFields<MutationUpdateCoachBillingArgs, 'input'>>;
  updateGoal?: Resolver<ResolversTypes['Goal'], ParentType, ContextType, RequireFields<MutationUpdateGoalArgs, 'id' | 'input'>>;
  updateSessionLog?: Resolver<ResolversTypes['SessionLog'], ParentType, ContextType, RequireFields<MutationUpdateSessionLogArgs, 'id' | 'input'>>;
  updateTrainingPlan?: Resolver<ResolversTypes['TrainingPlan'], ParentType, ContextType, RequireFields<MutationUpdateTrainingPlanArgs, 'id' | 'input'>>;
};

export type QueryResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['Query'] = ResolversParentTypes['Query']> = {
  assistants?: Resolver<Array<Maybe<ResolversTypes['Assistant']>>, ParentType, ContextType, Partial<QueryAssistantsArgs>>;
  athlete?: Resolver<Maybe<ResolversTypes['Athlete']>, ParentType, ContextType, RequireFields<QueryAthleteArgs, 'id'>>;
  athletes?: Resolver<Array<ResolversTypes['Athlete']>, ParentType, ContextType>;
  coach?: Resolver<Maybe<ResolversTypes['Coach']>, ParentType, ContextType, RequireFields<QueryCoachArgs, 'id'>>;
  goal?: Resolver<Maybe<ResolversTypes['Goal']>, ParentType, ContextType, RequireFields<QueryGoalArgs, 'id'>>;
  goals?: Resolver<Array<ResolversTypes['Goal']>, ParentType, ContextType, Partial<QueryGoalsArgs>>;
  me?: Resolver<Maybe<ResolversTypes['Coach']>, ParentType, ContextType>;
  sessionLog?: Resolver<Maybe<ResolversTypes['SessionLog']>, ParentType, ContextType, RequireFields<QuerySessionLogArgs, 'id'>>;
  sessionLogs?: Resolver<Array<ResolversTypes['SessionLog']>, ParentType, ContextType, Partial<QuerySessionLogsArgs>>;
  trainingPlan?: Resolver<Maybe<ResolversTypes['TrainingPlan']>, ParentType, ContextType, RequireFields<QueryTrainingPlanArgs, 'id'>>;
  trainingPlans?: Resolver<Array<ResolversTypes['TrainingPlan']>, ParentType, ContextType, Partial<QueryTrainingPlansArgs>>;
};

export type RefinedGoalSuggestionResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['RefinedGoalSuggestion'] = ResolversParentTypes['RefinedGoalSuggestion']> = {
  improvedGoalStatement?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  keyChanges?: Resolver<Array<ResolversTypes['String']>, ParentType, ContextType>;
  rationale?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type SessionLogResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['SessionLog'] = ResolversParentTypes['SessionLog']> = {
  actionItems?: Resolver<Maybe<Array<ResolversTypes['String']>>, ParentType, ContextType>;
  aiMetadata?: Resolver<Maybe<ResolversTypes['AIMetadata']>, ParentType, ContextType>;
  athlete?: Resolver<ResolversTypes['Athlete'], ParentType, ContextType>;
  athleteFeedback?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  coachRating?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  date?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  deletedAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  durationMinutes?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  equipmentUsed?: Resolver<Maybe<Array<ResolversTypes['String']>>, ParentType, ContextType>;
  exercisesPerformed?: Resolver<Maybe<ResolversTypes['JSON']>, ParentType, ContextType>;
  goals?: Resolver<Array<ResolversTypes['Goal']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  intensityLevel?: Resolver<Maybe<ResolversTypes['SessionIntensity']>, ParentType, ContextType>;
  location?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  notes?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  sessionType?: Resolver<ResolversTypes['SessionType'], ParentType, ContextType>;
  summary?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  transcript?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  weatherConditions?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type SubscriptionResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['Subscription'] = ResolversParentTypes['Subscription']> = {
  athleteUpdated?: SubscriptionResolver<ResolversTypes['Athlete'], "athleteUpdated", ParentType, ContextType, RequireFields<SubscriptionAthleteUpdatedArgs, 'id'>>;
  goalAdded?: SubscriptionResolver<ResolversTypes['Goal'], "goalAdded", ParentType, ContextType, RequireFields<SubscriptionGoalAddedArgs, 'athleteId'>>;
  goalUpdated?: SubscriptionResolver<ResolversTypes['Goal'], "goalUpdated", ParentType, ContextType, RequireFields<SubscriptionGoalUpdatedArgs, 'id'>>;
  sessionLogAdded?: SubscriptionResolver<ResolversTypes['SessionLog'], "sessionLogAdded", ParentType, ContextType, RequireFields<SubscriptionSessionLogAddedArgs, 'athleteId'>>;
  sessionLogUpdated?: SubscriptionResolver<ResolversTypes['SessionLog'], "sessionLogUpdated", ParentType, ContextType, RequireFields<SubscriptionSessionLogUpdatedArgs, 'id'>>;
  trainingPlanGenerated?: SubscriptionResolver<ResolversTypes['TrainingPlan'], "trainingPlanGenerated", ParentType, ContextType, RequireFields<SubscriptionTrainingPlanGeneratedArgs, 'athleteId'>>;
};

export type SuccessIndicatorsResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['SuccessIndicators'] = ResolversParentTypes['SuccessIndicators']> = {
  measurementMethods?: Resolver<Array<ResolversTypes['String']>, ParentType, ContextType>;
  secondaryBenefits?: Resolver<Array<ResolversTypes['String']>, ParentType, ContextType>;
  successDefinition?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type TimelineResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['Timeline'] = ResolversParentTypes['Timeline']> = {
  duration?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  milestones?: Resolver<Array<ResolversTypes['String']>, ParentType, ContextType>;
  targetDate?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  urgencyLevel?: Resolver<ResolversTypes['UrgencyLevel'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type TrainingPlanResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['TrainingPlan'] = ResolversParentTypes['TrainingPlan']> = {
  assistants?: Resolver<Maybe<Array<ResolversTypes['Assistant']>>, ParentType, ContextType>;
  athlete?: Resolver<ResolversTypes['Athlete'], ParentType, ContextType>;
  completionPercentage?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  deletedAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  difficulty?: Resolver<ResolversTypes['TrainingPlanDifficulty'], ParentType, ContextType>;
  durationWeeks?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  endDate?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  generatedBy?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  generationMetadata?: Resolver<Maybe<ResolversTypes['JSON']>, ParentType, ContextType>;
  goals?: Resolver<Maybe<Array<ResolversTypes['Goal']>>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  notes?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  overview?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  planJson?: Resolver<Maybe<ResolversTypes['JSON']>, ParentType, ContextType>;
  sourcePrompt?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  startDate?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  status?: Resolver<ResolversTypes['TrainingPlanStatus'], ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type Resolvers<ContextType = GraphQLContext> = {
  AIMetadata?: AiMetadataResolvers<ContextType>;
  Assistant?: AssistantResolvers<ContextType>;
  Athlete?: AthleteResolvers<ContextType>;
  Availability?: AvailabilityResolvers<ContextType>;
  Coach?: CoachResolvers<ContextType>;
  CoachBilling?: CoachBillingResolvers<ContextType>;
  CoachingFeedback?: CoachingFeedbackResolvers<ContextType>;
  Constraints?: ConstraintsResolvers<ContextType>;
  CoreGoal?: CoreGoalResolvers<ContextType>;
  DateTime?: GraphQLScalarType;
  EvaluationSummary?: EvaluationSummaryResolvers<ContextType>;
  ExtractionConfidence?: ExtractionConfidenceResolvers<ContextType>;
  Goal?: GoalResolvers<ContextType>;
  GoalEvaluation?: GoalEvaluationResolvers<ContextType>;
  GoalEvaluationResponse?: GoalEvaluationResponseResolvers<ContextType>;
  JSON?: GraphQLScalarType;
  Motivation?: MotivationResolvers<ContextType>;
  Mutation?: MutationResolvers<ContextType>;
  Query?: QueryResolvers<ContextType>;
  RefinedGoalSuggestion?: RefinedGoalSuggestionResolvers<ContextType>;
  SessionLog?: SessionLogResolvers<ContextType>;
  Subscription?: SubscriptionResolvers<ContextType>;
  SuccessIndicators?: SuccessIndicatorsResolvers<ContextType>;
  Timeline?: TimelineResolvers<ContextType>;
  TrainingPlan?: TrainingPlanResolvers<ContextType>;
};

