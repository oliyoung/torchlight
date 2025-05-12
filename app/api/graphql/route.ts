import { readFileSync } from 'node:fs'
import { createSchema, createYoga } from 'graphql-yoga'
import resolvers from '@/app/api/graphql/resolvers'

interface NextContext {
  params: Promise<Record<string, string>>
}

const { handleRequest } = createYoga<NextContext>({
  schema: createSchema({
    typeDefs: readFileSync('app/api/graphql/schema.graphql', 'utf-8'),
    resolvers
  }),
  graphqlEndpoint: '/api/graphql',
  fetchAPI: { Response }
})

export {
  handleRequest as GET,
  handleRequest as POST,
  handleRequest as OPTIONS
}