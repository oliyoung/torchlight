export interface Client {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  tags: string[];
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
  goals: Goal[];
  sessionLogs: SessionLog[];
  birthday: string;
  gender: string;
  fitnessLevel: string;
  trainingHistory: string;
  height?: number;
  weight?: number;
}

export interface Goal {
  id: string;
  client: Client;
  title: string;
  description?: string;
  status: GoalStatus;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
  dueDate?: Date;
  progressNotes?: string;
  sessionLogs: SessionLog[];
}

export interface SessionLog {
  id: string;
  client: Client;
  date: Date;
  notes?: string;
  transcript?: string;
  summary?: string;
  actionItems?: string[];
  goals: Goal[];
  aiMetadata?: AIMetadata;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

export interface AIMetadata {
  summaryGenerated: boolean;
  nextStepsGenerated: boolean;
}

export enum GoalStatus {
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  PAUSED = 'PAUSED'
}

export interface AISummarizeSessionLogInput {
  sessionLogId: string;
}

export interface AIGeneratePlanInput {
  clientId: string;
  goalIds: string[];
  sessionLogIds: string[];
}

export interface AIAnalyzeProgressInput {
  clientId: string;
  startDate: Date;
  endDate: Date;
}

export interface AIGenerateSessionInput {
  clientId: string;
  goalIds: string[];
  sessionLogIds: string[];
}
