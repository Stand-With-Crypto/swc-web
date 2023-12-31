import { PrismaClient } from '@prisma/client'
import { Client } from '@planetscale/database'
import { PrismaPlanetScale } from '@prisma/adapter-planetscale'
import { fetch as undiciFetch } from 'undici'
import { requiredEnv } from '@/utils/shared/requiredEnv'

const DATABASE_URL = requiredEnv(process.env.DATABASE_URL, 'process.env.DATABASE_URL')
const client = new Client({ url: DATABASE_URL, fetch: undiciFetch })
const adapter = new PrismaPlanetScale(client)
const prisma = new PrismaClient({
  adapter,
  log: process.env.LOG_DATABASE ? ['query', 'info', 'warn', 'error'] : ['info', 'warn', 'error'],
})

// PrismaClient is attached to the `global` object in development to prevent
// exhausting your database connection limit.
//
// Learn more:
// https://pris.ly/d/help/next-js-best-practices

const globalForPrisma = global as unknown as { prisma: PrismaClient }

export const prismaClient = globalForPrisma.prisma || prisma

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prismaClient
