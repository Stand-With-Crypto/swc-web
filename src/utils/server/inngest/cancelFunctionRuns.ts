import * as Sentry from '@sentry/nextjs'
import { sub } from 'date-fns'
import { join } from 'node:path'

import { logger } from '@/utils/shared/logger'
import { requiredOutsideLocalEnv } from '@/utils/shared/requiredEnv'

const INNGEST_API_URL = requiredOutsideLocalEnv(
  process.env.INNGEST_API_URL,
  'INNGEST_API_URL',
  'Inngest utils',
)!

const INNGEST_APP_ID = requiredOutsideLocalEnv(
  process.env.INNGEST_APP_ID,
  'INNGEST_APP_ID',
  'Inngest utils',
)!

const INNGEST_SIGNING_KEY = requiredOutsideLocalEnv(
  process.env.INNGEST_SIGNING_KEY,
  'INNGEST_SIGNING_KEY',
  'Inngest utils',
)!

interface CancelFunctionRunsPayload {
  app_id: string
  function_id: string
  started_after: string
  started_before: string
  if: string
}

interface CancelFunctionRunsResponse {
  id: string
  environment_id: string
  function_id: string
  started_after: string
  started_before: string
  if: string
}

export async function cancelFunctionRuns(functionId: string, criteria: string) {
  try {
    const now = new Date()

    const startedAfter = sub(now, { hours: 1 }).toISOString()
    const startedBefore = now.toISOString()

    const body: CancelFunctionRunsPayload = {
      app_id: INNGEST_APP_ID,
      function_id: functionId,
      started_after: startedAfter,
      started_before: startedBefore,
      if: criteria,
    }

    const response = await fetch(join(INNGEST_API_URL, '/cancellations'), {
      body: JSON.stringify(body),
      headers: {
        Authorization: `Bearer ${INNGEST_SIGNING_KEY}`,
        'Content-Type': 'application/json',
      },
      method: 'POST',
    })

    const data = await response.json()

    return data as CancelFunctionRunsResponse
  } catch (error) {
    const sentryErrorId = Sentry.captureException(error, {
      extra: {
        criteria,
        functionId,
      },
      tags: {
        domain: 'InngestUtils',
      },
    })
    logger.error(`Error cancelling function runs. Sentry error id: ${sentryErrorId}.`)
  }
}
