import type { GraphQLResolveInfo, GraphQLScalarType, GraphQLScalarTypeConfig } from 'graphql';
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

export type AiAnalyzeProgressInput = {
  clientId: Scalars['ID']['input'];
  endDate: Scalars['DateTime']['input'];
  startDate: Scalars['DateTime']['input'];
};

export type AiGenerateSessionInput = {
  clientId: Scalars['ID']['input'];
  goalIds: Array<Scalars['ID']['input']>;
  sessionLogIds: Array<Scalars['ID']['input']>;
};

export type AiMetadata = {
  __typename?: 'AIMetadata';
  nextStepsGenerated: Scalars['Boolean']['output'];
  summaryGenerated: Scalars['Boolean']['output'];
};

export type AiSummarizeSessionLogInput = {
  sessionLogId: Scalars['ID']['input'];
};

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

export type AssistantsFilter = {
  role?: InputMaybe<Scalars['String']['input']>;
  sport: Scalars['String']['input'];
  strengths?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};

export type AssistantsInput = {
  filter?: InputMaybe<AssistantsFilter>;
};

export type Client = {
  __typename?: 'Client';
  birthday?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['DateTime']['output'];
  deletedAt?: Maybe<Scalars['DateTime']['output']>;
  email: Scalars['String']['output'];
  firstName: Scalars['String']['output'];
  fitnessLevel?: Maybe<Scalars['String']['output']>;
  gender?: Maybe<Scalars['String']['output']>;
  goals?: Maybe<Array<Goal>>;
  height?: Maybe<Scalars['Float']['output']>;
  id: Scalars['ID']['output'];
  lastName: Scalars['String']['output'];
  notes?: Maybe<Scalars['String']['output']>;
  sessionLogs?: Maybe<Array<SessionLog>>;
  tags?: Maybe<Array<Scalars['String']['output']>>;
  trainingHistory?: Maybe<Scalars['String']['output']>;
  trainingPlans: Array<TrainingPlan>;
  updatedAt: Scalars['DateTime']['output'];
  userId: Scalars['ID']['output'];
  weight?: Maybe<Scalars['Float']['output']>;
};

export type CreateClientInput = {
  birthday: Scalars['DateTime']['input'];
  email: Scalars['String']['input'];
  firstName: Scalars['String']['input'];
  lastName: Scalars['String']['input'];
  notes?: InputMaybe<Scalars['String']['input']>;
  tags?: InputMaybe<Array<Scalars['String']['input']>>;
};

export type CreateGoalInput = {
  clientId: Scalars['ID']['input'];
  description?: InputMaybe<Scalars['String']['input']>;
  dueDate?: InputMaybe<Scalars['DateTime']['input']>;
  title: Scalars['String']['input'];
};

export type CreateSessionLogInput = {
  clientId: Scalars['ID']['input'];
  date: Scalars['DateTime']['input'];
  goalIds?: InputMaybe<Array<Scalars['ID']['input']>>;
  notes?: InputMaybe<Scalars['String']['input']>;
  transcript?: InputMaybe<Scalars['String']['input']>;
};

export type CreateTrainingPlanInput = {
  assistantIds?: InputMaybe<Array<Scalars['ID']['input']>>;
  clientId: Scalars['ID']['input'];
  goalIds?: InputMaybe<Array<Scalars['ID']['input']>>;
};

export type Goal = {
  __typename?: 'Goal';
  client: Client;
  createdAt: Scalars['DateTime']['output'];
  deletedAt?: Maybe<Scalars['DateTime']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  dueDate?: Maybe<Scalars['DateTime']['output']>;
  id: Scalars['ID']['output'];
  progressNotes?: Maybe<Scalars['String']['output']>;
  sessionLogs: Array<SessionLog>;
  status: GoalStatus;
  title: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
};

export enum GoalStatus {
  Active = 'ACTIVE',
  Completed = 'COMPLETED',
  Paused = 'PAUSED'
}

export type Mutation = {
  __typename?: 'Mutation';
  analyzeProgress: Scalars['String']['output'];
  createClient: Client;
  createGoal: Goal;
  createSessionLog: SessionLog;
  createTrainingPlan: TrainingPlan;
  deleteClient: Scalars['Boolean']['output'];
  deleteGoal: Scalars['Boolean']['output'];
  deleteSessionLog: Scalars['Boolean']['output'];
  generateSession: SessionLog;
  summarizeSessionLog: SessionLog;
  updateClient: Client;
  updateGoal: Goal;
  updateSessionLog: SessionLog;
};


export type MutationAnalyzeProgressArgs = {
  input: AiAnalyzeProgressInput;
};


export type MutationCreateClientArgs = {
  input: CreateClientInput;
};


export type MutationCreateGoalArgs = {
  input: CreateGoalInput;
};


export type MutationCreateSessionLogArgs = {
  input: CreateSessionLogInput;
};


export type MutationCreateTrainingPlanArgs = {
  input: CreateTrainingPlanInput;
};


export type MutationDeleteClientArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteGoalArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteSessionLogArgs = {
  id: Scalars['ID']['input'];
};


export type MutationGenerateSessionArgs = {
  input: AiGenerateSessionInput;
};


export type MutationSummarizeSessionLogArgs = {
  input: AiSummarizeSessionLogInput;
};


export type MutationUpdateClientArgs = {
  id: Scalars['ID']['input'];
  input: UpdateClientInput;
};


export type MutationUpdateGoalArgs = {
  id: Scalars['ID']['input'];
  input: UpdateGoalInput;
};


export type MutationUpdateSessionLogArgs = {
  id: Scalars['ID']['input'];
  input: UpdateSessionLogInput;
};

export type Query = {
  __typename?: 'Query';
  assistants: Array<Maybe<Assistant>>;
  client?: Maybe<Client>;
  clients: Array<Client>;
  goal?: Maybe<Goal>;
  goals: Array<Goal>;
  sessionLog?: Maybe<SessionLog>;
  sessionLogs: Array<SessionLog>;
  trainingPlan?: Maybe<TrainingPlan>;
  trainingPlans: Array<TrainingPlan>;
};


export type QueryAssistantsArgs = {
  input?: InputMaybe<AssistantsInput>;
};


export type QueryClientArgs = {
  id: Scalars['ID']['input'];
};


export type QueryGoalArgs = {
  clientId: Scalars['ID']['input'];
  id: Scalars['ID']['input'];
};


export type QueryGoalsArgs = {
  clientId: Scalars['ID']['input'];
};


export type QuerySessionLogArgs = {
  id: Scalars['ID']['input'];
};


export type QuerySessionLogsArgs = {
  clientId: Scalars['ID']['input'];
};


export type QueryTrainingPlanArgs = {
  id: Scalars['ID']['input'];
};


export type QueryTrainingPlansArgs = {
  clientId?: InputMaybe<Scalars['ID']['input']>;
};

export type SessionLog = {
  __typename?: 'SessionLog';
  actionItems?: Maybe<Array<Scalars['String']['output']>>;
  aiMetadata?: Maybe<AiMetadata>;
  client: Client;
  createdAt: Scalars['DateTime']['output'];
  date: Scalars['DateTime']['output'];
  deletedAt?: Maybe<Scalars['DateTime']['output']>;
  goals: Array<Goal>;
  id: Scalars['ID']['output'];
  notes?: Maybe<Scalars['String']['output']>;
  summary?: Maybe<Scalars['String']['output']>;
  transcript?: Maybe<Scalars['String']['output']>;
  updatedAt: Scalars['DateTime']['output'];
};

export type Subscription = {
  __typename?: 'Subscription';
  clientUpdated: Client;
  goalAdded: Goal;
  goalUpdated: Goal;
  sessionLogAdded: SessionLog;
  sessionLogUpdated: SessionLog;
  trainingPlanGenerated: TrainingPlan;
};


export type SubscriptionClientUpdatedArgs = {
  id: Scalars['ID']['input'];
};


export type SubscriptionGoalAddedArgs = {
  clientId: Scalars['ID']['input'];
};


export type SubscriptionGoalUpdatedArgs = {
  id: Scalars['ID']['input'];
};


export type SubscriptionSessionLogAddedArgs = {
  clientId: Scalars['ID']['input'];
};


export type SubscriptionSessionLogUpdatedArgs = {
  id: Scalars['ID']['input'];
};


export type SubscriptionTrainingPlanGeneratedArgs = {
  clientId: Scalars['ID']['input'];
};

export type TrainingPlan = {
  __typename?: 'TrainingPlan';
  assistants?: Maybe<Array<Assistant>>;
  client?: Maybe<Client>;
  createdAt: Scalars['DateTime']['output'];
  deletedAt?: Maybe<Scalars['DateTime']['output']>;
  generatedBy?: Maybe<Scalars['String']['output']>;
  goals: Array<Goal>;
  id: Scalars['ID']['output'];
  overview?: Maybe<Scalars['String']['output']>;
  planJson: Scalars['JSON']['output'];
  sourcePrompt?: Maybe<Scalars['String']['output']>;
  title: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
};

export type UpdateClientInput = {
  email?: InputMaybe<Scalars['String']['input']>;
  firstName?: InputMaybe<Scalars['String']['input']>;
  lastName?: InputMaybe<Scalars['String']['input']>;
  notes?: InputMaybe<Scalars['String']['input']>;
  tags?: InputMaybe<Array<Scalars['String']['input']>>;
};

export type UpdateGoalInput = {
  description?: InputMaybe<Scalars['String']['input']>;
  dueDate?: InputMaybe<Scalars['DateTime']['input']>;
  progressNotes?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<GoalStatus>;
  title?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateSessionLogInput = {
  actionItems?: InputMaybe<Array<Scalars['String']['input']>>;
  goalIds?: InputMaybe<Array<Scalars['ID']['input']>>;
  notes?: InputMaybe<Scalars['String']['input']>;
  summary?: InputMaybe<Scalars['String']['input']>;
  transcript?: InputMaybe<Scalars['String']['input']>;
};



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
  AIAnalyzeProgressInput: AiAnalyzeProgressInput;
  AIGenerateSessionInput: AiGenerateSessionInput;
  AIMetadata: ResolverTypeWrapper<AiMetadata>;
  AISummarizeSessionLogInput: AiSummarizeSessionLogInput;
  Assistant: ResolverTypeWrapper<Assistant>;
  AssistantsFilter: AssistantsFilter;
  AssistantsInput: AssistantsInput;
  Boolean: ResolverTypeWrapper<Scalars['Boolean']['output']>;
  Client: ResolverTypeWrapper<Client>;
  CreateClientInput: CreateClientInput;
  CreateGoalInput: CreateGoalInput;
  CreateSessionLogInput: CreateSessionLogInput;
  CreateTrainingPlanInput: CreateTrainingPlanInput;
  DateTime: ResolverTypeWrapper<Scalars['DateTime']['output']>;
  Float: ResolverTypeWrapper<Scalars['Float']['output']>;
  Goal: ResolverTypeWrapper<Goal>;
  GoalStatus: GoalStatus;
  ID: ResolverTypeWrapper<Scalars['ID']['output']>;
  JSON: ResolverTypeWrapper<Scalars['JSON']['output']>;
  Mutation: ResolverTypeWrapper<{}>;
  Query: ResolverTypeWrapper<{}>;
  SessionLog: ResolverTypeWrapper<SessionLog>;
  String: ResolverTypeWrapper<Scalars['String']['output']>;
  Subscription: ResolverTypeWrapper<{}>;
  TrainingPlan: ResolverTypeWrapper<TrainingPlan>;
  UpdateClientInput: UpdateClientInput;
  UpdateGoalInput: UpdateGoalInput;
  UpdateSessionLogInput: UpdateSessionLogInput;
};

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = {
  AIAnalyzeProgressInput: AiAnalyzeProgressInput;
  AIGenerateSessionInput: AiGenerateSessionInput;
  AIMetadata: AiMetadata;
  AISummarizeSessionLogInput: AiSummarizeSessionLogInput;
  Assistant: Assistant;
  AssistantsFilter: AssistantsFilter;
  AssistantsInput: AssistantsInput;
  Boolean: Scalars['Boolean']['output'];
  Client: Client;
  CreateClientInput: CreateClientInput;
  CreateGoalInput: CreateGoalInput;
  CreateSessionLogInput: CreateSessionLogInput;
  CreateTrainingPlanInput: CreateTrainingPlanInput;
  DateTime: Scalars['DateTime']['output'];
  Float: Scalars['Float']['output'];
  Goal: Goal;
  ID: Scalars['ID']['output'];
  JSON: Scalars['JSON']['output'];
  Mutation: {};
  Query: {};
  SessionLog: SessionLog;
  String: Scalars['String']['output'];
  Subscription: {};
  TrainingPlan: TrainingPlan;
  UpdateClientInput: UpdateClientInput;
  UpdateGoalInput: UpdateGoalInput;
  UpdateSessionLogInput: UpdateSessionLogInput;
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

export type ClientResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['Client'] = ResolversParentTypes['Client']> = {
  birthday?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  deletedAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  email?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  firstName?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  fitnessLevel?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  gender?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  goals?: Resolver<Maybe<Array<ResolversTypes['Goal']>>, ParentType, ContextType>;
  height?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  lastName?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  notes?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  sessionLogs?: Resolver<Maybe<Array<ResolversTypes['SessionLog']>>, ParentType, ContextType>;
  tags?: Resolver<Maybe<Array<ResolversTypes['String']>>, ParentType, ContextType>;
  trainingHistory?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  trainingPlans?: Resolver<Array<ResolversTypes['TrainingPlan']>, ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  userId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  weight?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export interface DateTimeScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['DateTime'], any> {
  name: 'DateTime';
}

export type GoalResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['Goal'] = ResolversParentTypes['Goal']> = {
  client?: Resolver<ResolversTypes['Client'], ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  deletedAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  description?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  dueDate?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  progressNotes?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  sessionLogs?: Resolver<Array<ResolversTypes['SessionLog']>, ParentType, ContextType>;
  status?: Resolver<ResolversTypes['GoalStatus'], ParentType, ContextType>;
  title?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export interface JsonScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['JSON'], any> {
  name: 'JSON';
}

export type MutationResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['Mutation'] = ResolversParentTypes['Mutation']> = {
  analyzeProgress?: Resolver<ResolversTypes['String'], ParentType, ContextType, RequireFields<MutationAnalyzeProgressArgs, 'input'>>;
  createClient?: Resolver<ResolversTypes['Client'], ParentType, ContextType, RequireFields<MutationCreateClientArgs, 'input'>>;
  createGoal?: Resolver<ResolversTypes['Goal'], ParentType, ContextType, RequireFields<MutationCreateGoalArgs, 'input'>>;
  createSessionLog?: Resolver<ResolversTypes['SessionLog'], ParentType, ContextType, RequireFields<MutationCreateSessionLogArgs, 'input'>>;
  createTrainingPlan?: Resolver<ResolversTypes['TrainingPlan'], ParentType, ContextType, RequireFields<MutationCreateTrainingPlanArgs, 'input'>>;
  deleteClient?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType, RequireFields<MutationDeleteClientArgs, 'id'>>;
  deleteGoal?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType, RequireFields<MutationDeleteGoalArgs, 'id'>>;
  deleteSessionLog?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType, RequireFields<MutationDeleteSessionLogArgs, 'id'>>;
  generateSession?: Resolver<ResolversTypes['SessionLog'], ParentType, ContextType, RequireFields<MutationGenerateSessionArgs, 'input'>>;
  summarizeSessionLog?: Resolver<ResolversTypes['SessionLog'], ParentType, ContextType, RequireFields<MutationSummarizeSessionLogArgs, 'input'>>;
  updateClient?: Resolver<ResolversTypes['Client'], ParentType, ContextType, RequireFields<MutationUpdateClientArgs, 'id' | 'input'>>;
  updateGoal?: Resolver<ResolversTypes['Goal'], ParentType, ContextType, RequireFields<MutationUpdateGoalArgs, 'id' | 'input'>>;
  updateSessionLog?: Resolver<ResolversTypes['SessionLog'], ParentType, ContextType, RequireFields<MutationUpdateSessionLogArgs, 'id' | 'input'>>;
};

export type QueryResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['Query'] = ResolversParentTypes['Query']> = {
  assistants?: Resolver<Array<Maybe<ResolversTypes['Assistant']>>, ParentType, ContextType, Partial<QueryAssistantsArgs>>;
  client?: Resolver<Maybe<ResolversTypes['Client']>, ParentType, ContextType, RequireFields<QueryClientArgs, 'id'>>;
  clients?: Resolver<Array<ResolversTypes['Client']>, ParentType, ContextType>;
  goal?: Resolver<Maybe<ResolversTypes['Goal']>, ParentType, ContextType, RequireFields<QueryGoalArgs, 'clientId' | 'id'>>;
  goals?: Resolver<Array<ResolversTypes['Goal']>, ParentType, ContextType, RequireFields<QueryGoalsArgs, 'clientId'>>;
  sessionLog?: Resolver<Maybe<ResolversTypes['SessionLog']>, ParentType, ContextType, RequireFields<QuerySessionLogArgs, 'id'>>;
  sessionLogs?: Resolver<Array<ResolversTypes['SessionLog']>, ParentType, ContextType, RequireFields<QuerySessionLogsArgs, 'clientId'>>;
  trainingPlan?: Resolver<Maybe<ResolversTypes['TrainingPlan']>, ParentType, ContextType, RequireFields<QueryTrainingPlanArgs, 'id'>>;
  trainingPlans?: Resolver<Array<ResolversTypes['TrainingPlan']>, ParentType, ContextType, Partial<QueryTrainingPlansArgs>>;
};

export type SessionLogResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['SessionLog'] = ResolversParentTypes['SessionLog']> = {
  actionItems?: Resolver<Maybe<Array<ResolversTypes['String']>>, ParentType, ContextType>;
  aiMetadata?: Resolver<Maybe<ResolversTypes['AIMetadata']>, ParentType, ContextType>;
  client?: Resolver<ResolversTypes['Client'], ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  date?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  deletedAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  goals?: Resolver<Array<ResolversTypes['Goal']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  notes?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  summary?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  transcript?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type SubscriptionResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['Subscription'] = ResolversParentTypes['Subscription']> = {
  clientUpdated?: SubscriptionResolver<ResolversTypes['Client'], "clientUpdated", ParentType, ContextType, RequireFields<SubscriptionClientUpdatedArgs, 'id'>>;
  goalAdded?: SubscriptionResolver<ResolversTypes['Goal'], "goalAdded", ParentType, ContextType, RequireFields<SubscriptionGoalAddedArgs, 'clientId'>>;
  goalUpdated?: SubscriptionResolver<ResolversTypes['Goal'], "goalUpdated", ParentType, ContextType, RequireFields<SubscriptionGoalUpdatedArgs, 'id'>>;
  sessionLogAdded?: SubscriptionResolver<ResolversTypes['SessionLog'], "sessionLogAdded", ParentType, ContextType, RequireFields<SubscriptionSessionLogAddedArgs, 'clientId'>>;
  sessionLogUpdated?: SubscriptionResolver<ResolversTypes['SessionLog'], "sessionLogUpdated", ParentType, ContextType, RequireFields<SubscriptionSessionLogUpdatedArgs, 'id'>>;
  trainingPlanGenerated?: SubscriptionResolver<ResolversTypes['TrainingPlan'], "trainingPlanGenerated", ParentType, ContextType, RequireFields<SubscriptionTrainingPlanGeneratedArgs, 'clientId'>>;
};

export type TrainingPlanResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['TrainingPlan'] = ResolversParentTypes['TrainingPlan']> = {
  assistants?: Resolver<Maybe<Array<ResolversTypes['Assistant']>>, ParentType, ContextType>;
  client?: Resolver<Maybe<ResolversTypes['Client']>, ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  deletedAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  generatedBy?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  goals?: Resolver<Array<ResolversTypes['Goal']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  overview?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  planJson?: Resolver<ResolversTypes['JSON'], ParentType, ContextType>;
  sourcePrompt?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  title?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type Resolvers<ContextType = GraphQLContext> = {
  AIMetadata?: AiMetadataResolvers<ContextType>;
  Assistant?: AssistantResolvers<ContextType>;
  Client?: ClientResolvers<ContextType>;
  DateTime?: GraphQLScalarType;
  Goal?: GoalResolvers<ContextType>;
  JSON?: GraphQLScalarType;
  Mutation?: MutationResolvers<ContextType>;
  Query?: QueryResolvers<ContextType>;
  SessionLog?: SessionLogResolvers<ContextType>;
  Subscription?: SubscriptionResolvers<ContextType>;
  TrainingPlan?: TrainingPlanResolvers<ContextType>;
};

