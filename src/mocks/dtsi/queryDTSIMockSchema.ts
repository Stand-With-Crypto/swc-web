import introspectionResult from '@/data/dtsi/introspection.json'
import { dtsiBillMockResolver } from '@/mocks/dtsi/mockResolvers/dtsiBillMockResolver'
import { dtsiPersonMockResolver } from '@/mocks/dtsi/mockResolvers/dtsiPersonMockResolver'
import { dtsiPersonStanceMockResolver } from '@/mocks/dtsi/mockResolvers/dtsiPersonStanceMockResolver'
import { dtsiPersonStanceQuoteMockResolver } from '@/mocks/dtsi/mockResolvers/dtsiPersonStanceQuoteMockResolver'
import { dtsiTweetMediaMockResolver } from '@/mocks/dtsi/mockResolvers/dtsiTweetMediaMockResolver'
import { dtsiTweetMockResolver } from '@/mocks/dtsi/mockResolvers/dtsiTweetMockResolver'
import { dtsiTwitterAccountMockResolver } from '@/mocks/dtsi/mockResolvers/dtsiTwitterAccountMockResolver'
import { fakerFields } from '@/mocks/fakerUtils'
import { faker } from '@faker-js/faker'
import { addMocksToSchema } from '@graphql-tools/mock'
import { buildClientSchema, graphql } from 'graphql'

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
    Float: () => faker.number.float({ min: 0, max: 100, precision: 0.001 }),
    ID: () => fakerFields.id(),
    Person: dtsiPersonMockResolver,
    PersonStanceQuote: dtsiPersonStanceQuoteMockResolver,
    PersonStance: dtsiPersonStanceMockResolver,
    Tweet: dtsiTweetMockResolver,
    TweetMedia: dtsiTweetMediaMockResolver,
    TwitterAccount: dtsiTwitterAccountMockResolver,
    Bill: dtsiBillMockResolver,
  },
})

export function queryDTSIMockSchema<R>(query: string, variables?: any) {
  faker.seed(1)
  return graphql({
    schema: schemaWithMocks,
    source: query,
    variableValues: variables,
  }).then(result => {
    if (result.errors) {
      throw new Error(`queryDTSIMockSchema threw with \n${JSON.stringify(result.errors, null, 4)}`)
    }
    return result.data as R
  })
}
