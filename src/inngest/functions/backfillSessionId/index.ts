import * as Sentry from '@sentry/nextjs'

import { inngest } from '@/inngest/inngest'
import { onScriptFailure } from '@/inngest/onScriptFailure'
import { prismaClient } from '@/utils/server/prismaClient'

const BACKFILL_SESSION_ID_CRON_JOB_FUNCTION_ID = 'script.backfill-session-id'
const BACKFILL_SESSION_ID_INNGEST_EVENT_NAME = 'script/backfill.session.id'

const BACKFILL_SESSION_ID_BATCH_SIZE = Number(process.env.BACKFILL_SESSION_ID_BATCH_SIZE) || 2000

export const backfillSessionIdCronJob = inngest.createFunction(
  {
    id: BACKFILL_SESSION_ID_CRON_JOB_FUNCTION_ID,
    retries: 0,
    concurrency: 1,
    onFailure: onScriptFailure,
  },
  {
    event: BACKFILL_SESSION_ID_INNGEST_EVENT_NAME,
  },
  async ({ step, logger }) => {
    const usersCount = await step.run('get-users-count', async () => {
      return prismaClient.user.count({
        where: {
          userSessions: {
            none: { id: undefined },
          },
        },
      })
    })

    logger.info(`Users with no session id: ${usersCount}`)
    const numBatches = Math.ceil(usersCount / BACKFILL_SESSION_ID_BATCH_SIZE)

    for (let i = 0; i < numBatches; i++) {
      const batchResult = await step.run(`backfill-session-id-batch-${i}`, async () => {
        const users = await prismaClient.user.findMany({
          select: { id: true },
          where: {
            userSessions: {
              none: { id: undefined },
            },
          },
          take: BACKFILL_SESSION_ID_BATCH_SIZE,
        })

        try {
          await prismaClient.userSession.createMany({
            data: users.map(({ id }) => ({ userId: id })),
          })
        } catch (error) {
          Sentry.captureException(error, {
            tags: {
              domain: 'backfillSessionIds',
              message: `error creating sessionId for users on batch ${i}`,
            },
          })
        }

        return {
          usersCount: users.length,
          totalSessionIdsBackfilled: users.length * (i + 1),
        }
      })

      logger.info(`Batch ${i} finished creating session for ${batchResult.usersCount} users`)
    }

    logger.info('Backfill session id function finished')
  },
)
