import { readFileSync } from 'node:fs'
import { createSchema, createYoga, type YogaInitialContext } from 'graphql-yoga'
import mutations from './mutations';
import queries from './queries';
import subscriptions from './subscriptions';
import { supabase } from '@/lib/supabase';
import type { User } from '@supabase/supabase-js';
import aiMutations from './mutations/ai';
export interface GraphQLContext extends YogaInitialContext {
  user: User | null;
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
        ...aiMutations,
      },
      Subscription: {
        ...subscriptions,
      },
    }
  }),
  context: async () => {
    // const { data: { user } } = await supabase.auth.getUser()
    // console.log(user);
    const user = { id: '123' }
    return ({ user })
  },
  graphqlEndpoint: '/api/graphql',
  fetchAPI: { Response }
})

export {
  handleRequest as GET,
  handleRequest as POST,
  handleRequest as OPTIONS
}