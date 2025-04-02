import { defineConfig } from 'cypress'

import { prismaClient } from '@/utils/server/prismaClient'

export default defineConfig({
  projectId: process.env.CYPRESS_PROJECT_ID,
  // iPhone 12 Pro resolution
  viewportWidth: 390,
  viewportHeight: 844,
  defaultCommandTimeout: 10000,
  retries: {
    experimentalStrategy: 'detect-flake-and-pass-on-threshold',
    experimentalOptions: {
      maxRetries: 7,
      passesRequired: 2,
    },
    openMode: true,
    runMode: true,
  },
  e2e: {
    env: {
      SWC_INTERNAL_ENDPOINTS_SECRET: process.env.SWC_INTERNAL_ENDPOINTS_SECRET,
      USER_ACCESS_LOCATION: 'us',
    },
    baseUrl: 'http://localhost:3000',
    setupNodeEvents(on) {
      on('task', {
        executeDb: query => {
          return executeDbWithPrisma(query)
        },
        queryDb: query => {
          return queryDbWithPrisma(query)
        },
      })
    },
  },
})

/**
 * Use this function for mutations (INSERT, UPDATE, DELETE, etc.).
 *
 * @param query
 * @returns
 */
async function executeDbWithPrisma(query: string) {
  return await prismaClient.$executeRawUnsafe(query)
}

/**
 * Use this function for SELECT.
 *
 * @param query
 * @returns
 */
async function queryDbWithPrisma(query: string) {
  return await prismaClient.$queryRawUnsafe(query)
}
