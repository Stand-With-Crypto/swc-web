import * as Sentry from '@sentry/nextjs'
import { Pool, QueryResultRow } from 'pg'

import { requiredOutsideLocalEnv } from '@/utils/shared/requiredEnv'

const DISTRICT_GEO_DATABASE_URL = requiredOutsideLocalEnv(
  process.env.DISTRICT_GEO_DATABASE_URL,
  'DISTRICT_GEO_DATABASE_URL',
  'Query district by lat/long',
)

const pool = DISTRICT_GEO_DATABASE_URL
  ? new Pool({
      connectionString: DISTRICT_GEO_DATABASE_URL,
    })
  : null

pool?.on('error', err => {
  Sentry.captureException(err, {
    tags: {
      domain: 'postgis',
    },
  })
})

export const queryPostgis = async <T extends QueryResultRow>(query: string, params: any[] = []) => {
  if (!pool) return

  return pool.query<T>(query, params)
}
