import { Client } from '@planetscale/database'
import { PrismaPlanetScale } from '@prisma/adapter-planetscale'
import { PrismaClient } from '@prisma/client'
import { PrismaClientOptions } from '@prisma/client/runtime/library'
import logQuery from 'prisma/extensions/logQuery'
import { fetch as undiciFetch } from 'undici'

import { IS_DEVELOPING_OFFLINE } from '@/utils/shared/executionEnvironment'
import { requiredEnv } from '@/utils/shared/requiredEnv'
import { toBool } from '@/utils/shared/toBool'

const DATABASE_URL = requiredEnv(process.env.DATABASE_URL, 'process.env.DATABASE_URL')

const createPrisma = () => {
  const isLogDatabaseActive = toBool(process.env.LOG_DATABASE)

  const log: PrismaClientOptions['log'] = isLogDatabaseActive
    ? ['query', 'info', 'warn', 'error']
    : ['info', 'warn', 'error']
  if (IS_DEVELOPING_OFFLINE || DATABASE_URL.includes('localhost')) {
    return new PrismaClient({
      log,
    })
  }
  const client = new Client({ url: DATABASE_URL, fetch: undiciFetch })
  const adapter = new PrismaPlanetScale(client)
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

const globalForPrisma = global as unknown as { prisma: PrismaClient }

export const prismaClient = globalForPrisma.prisma || createPrisma()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prismaClient
