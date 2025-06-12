import { neonConfig, Pool } from '@neondatabase/serverless'
import { PrismaNeon } from '@prisma/adapter-neon'
import { PrismaClientOptions } from '@prisma/client/runtime/library'
import logQuery from 'prisma/extensions/logQuery'
import { WebSocket } from 'undici'

import { PrismaClient } from '@/data/prisma/generated/swc-civic'
import { IS_DEVELOPING_OFFLINE } from '@/utils/shared/executionEnvironment'
import { requiredOutsideLocalEnv } from '@/utils/shared/requiredEnv'
import { toBool } from '@/utils/shared/toBool'

const SWC_CIVIC_DATABASE_URL = requiredOutsideLocalEnv(
  process.env.SWC_CIVIC_DATABASE_URL,
  'SWC_CIVIC_DATABASE_URL',
  'swc-civic | Query electoral zone by lat/long',
)

neonConfig.webSocketConstructor = WebSocket

const createPrisma = () => {
  const isLogDatabaseActive = toBool(process.env.LOG_DATABASE)

  const log: PrismaClientOptions['log'] = isLogDatabaseActive
    ? ['query', 'info', 'warn', 'error']
    : ['info', 'warn', 'error']
  if (IS_DEVELOPING_OFFLINE || SWC_CIVIC_DATABASE_URL?.includes('localhost')) {
    return new PrismaClient({
      log,
    })
  }
  const pool = new Pool({ connectionString: SWC_CIVIC_DATABASE_URL })
  const adapter = new PrismaNeon(pool)
  return isLogDatabaseActive
    ? new PrismaClient({
        adapter,
        log,
      }).$extends(logQuery)
    : new PrismaClient({
        adapter,
        log,
      })
}

// PrismaClient is attached to the `global` object in development to prevent
// exhausting your database connection limit.
//
// Learn more:
// https://pris.ly/d/help/next-js-best-practices

const globalForPrisma = global as unknown as {
  swcCivicPrisma: PrismaClient
}

export const civicPrismaClient = globalForPrisma.swcCivicPrisma || createPrisma()

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.swcCivicPrisma = civicPrismaClient
}
