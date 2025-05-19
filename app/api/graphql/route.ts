import { readFileSync } from 'node:fs'
import { createSchema, createYoga, type YogaInitialContext } from 'graphql-yoga'
import { PubSub } from 'graphql-subscriptions'
import mutations from './mutations';
import queries from './queries';
import subscriptions from './subscriptions';
import type { User } from '@supabase/supabase-js';
import { getClientById } from "@/lib/repository/client";
import { logger } from '@/lib/logger';
import { getAssistantsByTrainingPlanId } from "@/lib/repository/assistant";
import { getGoalsByTrainingPlanId } from "@/lib/repository/goal";

export interface GraphQLContext extends YogaInitialContext {
  user: User | null;
  pubsub: PubSub;
}

const pubsub = new PubSub();

// Export pubsub so it can be used by asynchronous background tasks
export { pubsub };

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
          const clientId = parent.client_id || parent.client?.id;
          if (!clientId) return null;
          return getClientById(context?.user?.id ?? null, clientId);
        },
        assistants: async (parent) => {
          return getAssistantsByTrainingPlanId(Number(parent.id));
        },
        goals: async (parent) => {
          return getGoalsByTrainingPlanId(Number(parent.id));
        },
      },
    }
  }),
  context: async () => {
    // const { data: { user } } = await supabase.auth.getUser()
    // logger.info(user);
    const user = { id: '123' }
    return ({ user, pubsub });
  },
  graphqlEndpoint: '/api/graphql',
  fetchAPI: { Response }
})

export {
  handleRequest as GET,
  handleRequest as POST,
  handleRequest as OPTIONS
}