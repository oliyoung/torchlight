// @ts-nocheck
import { readFileSync } from 'node:fs'
import { createAssistantLoader } from '@/lib/data-loaders/assistant';
import { createAthleteLoader } from '@/lib/data-loaders/athlete';
import { createCoachLoaders } from '@/lib/data-loaders/coach';
import { createCoachBillingLoaders } from '@/lib/data-loaders/coachBilling';
import { createGoalLoader } from '@/lib/data-loaders/goal';
import {
  createAthleteTrainingPlanIdsLoader,
  createGoalSessionLogIdsLoader,
  createGoalTrainingPlanIdsLoader,
  createSessionLogGoalIdsLoader,
  createTrainingPlanAssistantIdsLoader,
  createTrainingPlanGoalIdsLoader
} from '@/lib/data-loaders/relation';
import { createSessionLogLoader } from '@/lib/data-loaders/sessionLog';
import { createTrainingPlanLoader } from '@/lib/data-loaders/training-plan';
import { logger } from '@/lib/logger';
import { pubsub } from '@/lib/pubsub';
import { createClient } from '@supabase/supabase-js';
import { supabaseConfig } from '@/lib/supabase/config';
import type { User } from '@supabase/supabase-js';
import type DataLoader from 'dataloader'
import type { PubSub } from 'graphql-subscriptions'
import { createSchema, createYoga } from 'graphql-yoga'
import mutations from './mutations';
import queries from './queries';
import subscriptions from './subscriptions';

export interface GraphQLContext {
  user: User | null;
  userId: string | null;
  coachId: string | null;
  pubsub: PubSub;
  dataloaders?: {
    coachLoaders: ReturnType<typeof createCoachLoaders>;
    coachBillingLoaders: ReturnType<typeof createCoachBillingLoaders>;
  };
  loaders: {
    // Entity loaders
    athlete: ReturnType<typeof createAthleteLoader>;
    trainingPlan: ReturnType<typeof createTrainingPlanLoader>;
    assistant: ReturnType<typeof createAssistantLoader>;
    goal: ReturnType<typeof createGoalLoader>;
    sessionLog: ReturnType<typeof createSessionLogLoader>;

    // Relationship loaders
    athleteTrainingPlanIds: ReturnType<typeof createAthleteTrainingPlanIdsLoader>;
    goalSessionLogIds: ReturnType<typeof createGoalSessionLogIdsLoader>;
    goalTrainingPlanIds: ReturnType<typeof createGoalTrainingPlanIdsLoader>;
    sessionLogGoalIds: ReturnType<typeof createSessionLogGoalIdsLoader>;
    trainingPlanAssistantIds: ReturnType<typeof createTrainingPlanAssistantIdsLoader>;
    trainingPlanGoalIds: ReturnType<typeof createTrainingPlanGoalIdsLoader>;
  };
}

// Create a separate file for accessing pubsub singleton
// Export pubsub so it can be used by asynchronous background tasks
// export { pubsub };

/**
 * Helper function to safely load entities using DataLoader
 * Handles nullable IDs and filters out null results
 */
async function loadEntities<T>(
  ids: string[] | undefined | null,
  loader: DataLoader<string, T | null>
): Promise<T[]> {
  if (!ids || ids.length === 0) return [];

  try {
    const results = await Promise.all(
      ids.map(id => loader.load(id))
    );

    // Filter out any null results
    return results.filter(Boolean) as T[];
  } catch (error) {
    logger.error({ error }, 'Error loading entities');
    return [];
  }
}

const { handleRequest } = createYoga({
  schema: createSchema({
    typeDefs: readFileSync('app/api/graphql/schema.graphql', 'utf-8'),
    resolvers: {
      Query: {
        ...queries,
      },
      Mutation: {
        ...mutations,
      },
      Subscription: {
        ...subscriptions,
      },
      Coach: {
        billing: async (parent, _args, context) => {
          try {
            if (context.dataloaders?.coachBillingLoaders) {
              return await context.dataloaders.coachBillingLoaders.coachBillingByCoachId.load(parent.id);
            }
            return null;
          } catch (error) {
            logger.error({ error, coachId: parent.id }, 'Error resolving coach billing');
            return null;
          }
        },
        athletes: async (parent, _args, context) => {
          try {
            // Get all athletes for this coach - this will need to be implemented
            // For now, return empty array as the data loader structure needs to be updated
            return [];
          } catch (error) {
            logger.error({ error, coachId: parent.id }, 'Error resolving coach athletes');
            return [];
          }
        },
        trainingPlans: async (parent, _args, context) => {
          try {
            // Get all training plans for this coach - this will need to be implemented
            // For now, return empty array as the data loader structure needs to be updated
            return [];
          } catch (error) {
            logger.error({ error, coachId: parent.id }, 'Error resolving coach training plans');
            return [];
          }
        }
      },
      TrainingPlan: {
        athlete: async (parent, _args, context) => {
          try {
            const athleteId = parent.athleteId ?? parent.athlete_id ?? parent.athlete?.id;
            if (!athleteId) return null;
            return await context.loaders.athlete.load(athleteId);
          } catch (error) {
            logger.error({ error, parent }, 'Error resolving training plan athlete');
            return null;
          }
        },
        assistants: async (parent, _args, context) => {
          try {
            // Get assistant IDs for this training plan
            const assistantIds = await context.loaders.trainingPlanAssistantIds.load(parent.id);

            // Load each assistant using the assistant loader
            return loadEntities(assistantIds, context.loaders.assistant);
          } catch (error) {
            logger.error({ error, trainingPlanId: parent.id }, 'Error resolving training plan assistants');
            return [];
          }
        },
        goals: async (parent, _args, context) => {
          try {
            // Get goal IDs for this training plan
            const goalIds = await context.loaders.trainingPlanGoalIds.load(parent.id);

            // Load each goal using the goal loader
            return loadEntities(goalIds, context.loaders.goal);
          } catch (error) {
            logger.error({ error, trainingPlanId: parent.id }, 'Error resolving training plan goals');
            return [];
          }
        },
      },
      Athlete: {
        trainingPlans: async (parent, _args, context) => {
          try {
            // Get training plan IDs for this athlete
            const trainingPlanIds = await context.loaders.athleteTrainingPlanIds.load(parent.id);

            // Load each training plan using the training plan loader
            return loadEntities(trainingPlanIds, context.loaders.trainingPlan);
          } catch (error) {
            logger.error({ error, athleteId: parent.id }, 'Error resolving athlete training plans');
            return [];
          }
        }
      },
      Goal: {
        athlete: async (parent, _args, context) => {
          try {
            const athleteId = parent.athleteId ?? parent.athlete_id;
            if (!athleteId) return null;
            return context.loaders.athlete.load(athleteId);
          } catch (error) {
            logger.error({ error, goalId: parent.id }, 'Error resolving goal athlete');
            return null;
          }
        },
        sessionLogs: async (parent, _args, context) => {
          try {
            // Get session log IDs linked to this goal
            const sessionLogIds = await context.loaders.goalSessionLogIds.load(parent.id);

            // Load each session log using the session log loader
            return loadEntities(sessionLogIds, context.loaders.sessionLog);
          } catch (error) {
            logger.error({ error, goalId: parent.id }, 'Error resolving goal session logs');
            return [];
          }
        },
        trainingPlans: async (parent, _args, context) => {
          try {
            // Get training plan IDs for this goal
            const trainingPlanIds = await context.loaders.goalTrainingPlanIds.load(parent.id);

            // Load each training plan using the training plan loader
            return loadEntities(trainingPlanIds, context.loaders.trainingPlan);
          } catch (error) {
            logger.error({ error, goalId: parent.id }, 'Error resolving goal training plans');
            return [];
          }
        }
      },
      SessionLog: {
        athlete: async (parent, _args, context) => {
          try {
            const athleteId = parent.athlete_id;
            if (!athleteId) return null;
            return context.loaders.athlete.load(athleteId);
          } catch (error) {
            logger.error({ error, sessionLogId: parent.id }, 'Error resolving session log athlete');
            return null;
          }
        },
        goals: async (parent, _args, context) => {
          try {
            // Get goal IDs linked to this session log
            const goalIds = await context.loaders.sessionLogGoalIds.load(parent.id);

            // Load each goal using the goal loader
            return loadEntities(goalIds, context.loaders.goal);
          } catch (error) {
            logger.error({ error, sessionLogId: parent.id }, 'Error resolving session log goals');
            return [];
          }
        }
      },
    }
  }),
  context: async (req) => {
    let user: User | null = null

    const authHeader = req.request?.headers.get('authorization')

    if (authHeader?.startsWith('Bearer ')) {
      const accessToken = authHeader.replace('Bearer ', '')
      try {
        // Create a direct supabase client with the JWT token
        const supabase = createClient(supabaseConfig.url, supabaseConfig.anonKey, {
          global: {
            headers: {
              Authorization: `Bearer ${accessToken}`
            }
          }
        })

        // Use getUser() to validate the token and check expiration
        const { data: { user: headerUser }, error } = await supabase.auth.getUser()

        if (error) {
          logger.warn({ error: error.message }, 'Token validation failed')
          // Token is invalid or expired

        } else if (headerUser) {
          // Additional check: verify token hasn't expired by checking exp claim
          try {
            const tokenPayload = JSON.parse(atob(accessToken.split('.')[1]))
            const currentTime = Math.floor(Date.now() / 1000)
            if (tokenPayload.exp && tokenPayload.exp < currentTime) {
              logger.warn({ userId: headerUser.id, exp: tokenPayload.exp, now: currentTime }, 'Token has expired')
            } else {
              user = headerUser
            }
          } catch (tokenError) {
            logger.error({ error: tokenError }, 'Failed to parse JWT token')
          }
        }
      } catch (error) {
        logger.error({ error }, 'Failed to authenticate with Authorization header')
      }
    }

    if (user) {
      // Get the coach record to obtain coachId
      let coachId: string | null = null;
      try {
        const supabase = createClient(supabaseConfig.url, supabaseConfig.serviceRoleKey);
        const { data: coach } = await supabase
          .from('coaches')
          .select('id')
          .eq('user_id', user.id)
          .single();

        coachId = coach?.id || null;
      } catch (error) {
        logger.error({ error, userId: user.id }, 'Failed to fetch coach record');
      }

      // Create all data loaders
      const loaders = {
        // Entity loaders
        athlete: createAthleteLoader(coachId),
        trainingPlan: createTrainingPlanLoader(coachId),
        assistant: createAssistantLoader(),
        goal: createGoalLoader(coachId),
        sessionLog: createSessionLogLoader(coachId),

        // Relationship loaders
        athleteTrainingPlanIds: createAthleteTrainingPlanIdsLoader(coachId),
        goalSessionLogIds: createGoalSessionLogIdsLoader(),
        goalTrainingPlanIds: createGoalTrainingPlanIdsLoader(),
        sessionLogGoalIds: createSessionLogGoalIdsLoader(),
        trainingPlanAssistantIds: createTrainingPlanAssistantIdsLoader(),
        trainingPlanGoalIds: createTrainingPlanGoalIdsLoader(),
      };

      // Create coach-specific data loaders
      const dataloaders = {
        coachLoaders: createCoachLoaders(),
        coachBillingLoaders: createCoachBillingLoaders(),
      };

      return {
        user,
        userId: user.id,
        coachId,
        pubsub,
        loaders,
        dataloaders
      };
    }

    return {
      user: null,
      userId: null,
      coachId: null,
      pubsub,
      loaders: {} as any,
      dataloaders: undefined
    }
  },
  graphqlEndpoint: '/api/graphql',
  fetchAPI: { Response }
})

export async function GET(request: Request) {
  return handleRequest(request);
}

export async function POST(request: Request) {
  return handleRequest(request);
}

export async function OPTIONS(request: Request) {
  return handleRequest(request);
}