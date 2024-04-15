import { faker } from '@faker-js/faker'
import { addMocksToSchema } from '@graphql-tools/mock'
import { buildClientSchema, graphql } from 'graphql'

import introspectionResult from '@/data/dtsi/introspection.json'
import { dtsiQueryResolver } from '@/mocks/dtsi/mockResolvers/dtsiQueryResolver'
import { dtsiBillMockResolver } from '@/mocks/dtsi/mocks/dtsiBillMockResolver'
import { dtsiPersonMockResolver } from '@/mocks/dtsi/mocks/dtsiPersonMockResolver'
import { dtsiPersonRoleMockResolver } from '@/mocks/dtsi/mocks/dtsiPersonRoleResolver'
import { dtsiPersonStanceMockResolver } from '@/mocks/dtsi/mocks/dtsiPersonStanceMockResolver'
import { dtsiPersonStanceQuoteMockResolver } from '@/mocks/dtsi/mocks/dtsiPersonStanceQuoteMockResolver'
import { dtsiTweetMediaMockResolver } from '@/mocks/dtsi/mocks/dtsiTweetMediaMockResolver'
import { dtsiTweetMockResolver } from '@/mocks/dtsi/mocks/dtsiTweetMockResolver'
import { dtsiTwitterAccountMockResolver } from '@/mocks/dtsi/mocks/dtsiTwitterAccountMockResolver'
import { fakerFields } from '@/mocks/fakerUtils'

// see https://the-guild.dev/graphql/tools/docs/mocking for details

const schema = buildClientSchema(introspectionResult as any)
// Create a new schema with mocks
const schemaWithMocks = addMocksToSchema({
  schema,
  preserveResolvers: false,
  mocks: {
    DateTime: () => faker.date.past().toISOString(),
    String: () => faker.word.words(3),
    Json: () => ({}),
    Int: () => faker.number.int({ min: 0, max: 100 }),
    Boolean: () => faker.datatype.boolean(),
    Float: () => faker.number.float({ min: 0, max: 100, multipleOf: 0.001 }),
    ID: () => fakerFields.id(),
    Person: dtsiPersonMockResolver,
    PersonRole: dtsiPersonRoleMockResolver(),
    PersonStanceQuote: dtsiPersonStanceQuoteMockResolver,
    PersonStance: dtsiPersonStanceMockResolver,
    Tweet: dtsiTweetMockResolver,
    TweetMedia: dtsiTweetMediaMockResolver,
    TwitterAccount: dtsiTwitterAccountMockResolver,
    Bill: dtsiBillMockResolver,
    Query: () => ({}),
  },
  resolvers: () => ({
    Query: dtsiQueryResolver,
  }),
})

export const queryDTSIMockSchema = <R>(query: string, variables?: any) => {
  faker.seed(1)
  return graphql({
    schema: schemaWithMocks,
    source: query,
    variableValues: variables,
  }).then(result => {
    if (result.errors) {
      throw new Error(`queryDTSIMockSchema threw with \n${JSON.stringify(result.errors, null, 4)}`)
    }
    // results.data is a null prototype object, which is not supported
    // by RSC server -> client props. JSON.parse(JSON.stringify... solves this problem
    return JSON.parse(JSON.stringify(result.data)) as R
  })
}
