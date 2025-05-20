import { readFileSync } from 'node:fs'
import { createAssistantLoader } from '@/lib/data-loaders/assistant';
import { createClientLoader } from '@/lib/data-loaders/client';
import { createGoalLoader } from '@/lib/data-loaders/goal';
import {
  createClientTrainingPlanIdsLoader,
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
import type { User } from '@supabase/supabase-js';
import type DataLoader from 'dataloader'
import type { PubSub } from 'graphql-subscriptions'
import { type YogaInitialContext, createSchema, createYoga } from 'graphql-yoga'
import mutations from './mutations';
import queries from './queries';
import subscriptions from './subscriptions';

export interface GraphQLContext extends YogaInitialContext {
  user: User | null;
  pubsub: PubSub;
  loaders: {
    // Entity loaders
    client: ReturnType<typeof createClientLoader>;
    trainingPlan: ReturnType<typeof createTrainingPlanLoader>;
    assistant: ReturnType<typeof createAssistantLoader>;
    goal: ReturnType<typeof createGoalLoader>;
    sessionLog: ReturnType<typeof createSessionLogLoader>;

    // Relationship loaders
    clientTrainingPlanIds: ReturnType<typeof createClientTrainingPlanIdsLoader>;
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

const { handleRequest } = createYoga<GraphQLContext>({
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
      TrainingPlan: {
        client: async (parent, _args, context) => {
          try {
            const clientId = parent.client_id || parent.client?.id;
            if (!clientId) return null;
            return context.loaders.client.load(clientId);
          } catch (error) {
            logger.error({ error, parent }, 'Error resolving training plan client');
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
      Client: {
        trainingPlans: async (parent, _args, context) => {
          try {
            // Get training plan IDs for this client
            const trainingPlanIds = await context.loaders.clientTrainingPlanIds.load(parent.id);

            // Load each training plan using the training plan loader
            return loadEntities(trainingPlanIds, context.loaders.trainingPlan);
          } catch (error) {
            logger.error({ error, clientId: parent.id }, 'Error resolving client training plans');
            return [];
          }
        }
      },
      Goal: {
        client: async (parent, _args, context) => {
          try {
            const clientId = parent.client_id;
            if (!clientId) return null;
            return context.loaders.client.load(clientId);
          } catch (error) {
            logger.error({ error, goalId: parent.id }, 'Error resolving goal client');
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
        client: async (parent, _args, context) => {
          try {
            const clientId = parent.client_id;
            if (!clientId) return null;
            return context.loaders.client.load(clientId);
          } catch (error) {
            logger.error({ error, sessionLogId: parent.id }, 'Error resolving session log client');
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
  context: async () => {
    // Keep the hard-coded user as requested
    const user = { id: '123' }

    // Create all data loaders
    const loaders = {
      // Entity loaders
      client: createClientLoader(user.id),
      trainingPlan: createTrainingPlanLoader(user.id),
      assistant: createAssistantLoader(),
      goal: createGoalLoader(user.id),
      sessionLog: createSessionLogLoader(user.id),

      // Relationship loaders
      clientTrainingPlanIds: createClientTrainingPlanIdsLoader(user.id),
      goalSessionLogIds: createGoalSessionLogIdsLoader(),
      goalTrainingPlanIds: createGoalTrainingPlanIdsLoader(),
      sessionLogGoalIds: createSessionLogGoalIdsLoader(),
      trainingPlanAssistantIds: createTrainingPlanAssistantIdsLoader(),
      trainingPlanGoalIds: createTrainingPlanGoalIdsLoader(),
    };

    return { user, pubsub, loaders };
  },
  graphqlEndpoint: '/api/graphql',
  fetchAPI: { Response }
})

export {
  handleRequest as GET,
  handleRequest as POST,
  handleRequest as OPTIONS
}