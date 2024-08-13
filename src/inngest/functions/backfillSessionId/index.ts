import * as Sentry from '@sentry/nextjs'

import { inngest } from '@/inngest/inngest'
import { onScriptFailure } from '@/inngest/onScriptFailure'
import { prismaClient } from '@/utils/server/prismaClient'
import { getLogger } from '@/utils/shared/logger'

const BACKFILL_SESSION_ID_CRON_JOB_FUNCTION_ID = 'script.backfill-session-id'
const BACKFILL_SESSION_ID_INNGEST_EVENT_NAME = 'script/backfill.session.id'

const BACKFILL_SESSION_ID_BATCH_SIZE = Number(process.env.BACKFILL_SESSION_ID_BATCH_SIZE) || 2000

const logger = getLogger('backfillSessionId')
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
  async ({ step }) => {
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
      await step.run(`backfill-session-id-batch-${i}`, async () => {
        const users = await prismaClient.user.findMany({
          select: { id: true },
          where: {
            userSessions: {
              none: { id: undefined },
            },
          },
          take: BACKFILL_SESSION_ID_BATCH_SIZE,
        })

        for (const user of users) {
          try {
            await prismaClient.userSession.create({
              data: {
                user: { connect: { id: user.id } },
              },
            })
          } catch (error) {
            Sentry.captureException(error, {
              tags: {
                domain: 'backfillSessionIds',
                message: `error creating sessionId for user ${user.id}`,
              },
            })
          }
        }
        logger.info(`Batch ${i} finished creasting session for ${users.length} users`)
      })
    }

    logger.info('Backfill session id function finished')
  },
)
