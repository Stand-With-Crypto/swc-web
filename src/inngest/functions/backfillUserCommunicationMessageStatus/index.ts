import { CommunicationMessageStatus } from '@prisma/client'

import { inngest } from '@/inngest/inngest'
import { onScriptFailure } from '@/inngest/onScriptFailure'
import { prismaClient } from '@/utils/server/prismaClient'

const BACKFILL_USER_COMMUNICATION_MESSAGE_STATUS_INNGEST_FUNCTION_ID =
  'script.backfill-user-communication-message-status'

const BACKFILL_USER_COMMUNICATION_MESSAGE_STATUS_INNGEST_EVENT_NAME =
  'script/backfill.user.communication.message.status'

export interface BackfillUserCommunicationMessageStatusSchema {
  name: typeof BACKFILL_USER_COMMUNICATION_MESSAGE_STATUS_INNGEST_EVENT_NAME
}

const DATABASE_QUERY_LIMIT = Number(process.env.DATABASE_QUERY_LIMIT) || undefined

export const backfillUserCommunicationMessageStatus = inngest.createFunction(
  {
    id: BACKFILL_USER_COMMUNICATION_MESSAGE_STATUS_INNGEST_FUNCTION_ID,
    retries: 0,
    onFailure: onScriptFailure,
  },
  {
    event: BACKFILL_USER_COMMUNICATION_MESSAGE_STATUS_INNGEST_EVENT_NAME,
  },
  async ({ step, logger }) => {
    let updatedCommunications = 0
    let hasMoreMessages = true

    // We need to split the query limit in half to avoid Output size is too large errors
    const queryLimit = DATABASE_QUERY_LIMIT ? DATABASE_QUERY_LIMIT / 2 : undefined

    while (hasMoreMessages) {
      const userCommunicationIds = await step.run('fetch-user-communication', () =>
        prismaClient.userCommunication
          .findMany({
            select: {
              id: true,
            },
            where: {
              status: CommunicationMessageStatus.PROCESSING,
            },
            orderBy: {
              id: 'asc',
            },
            take: queryLimit,
            skip: updatedCommunications,
          })
          .then(res => res.map(({ id }) => id)),
      )

      await step.run('update-user-communication', () =>
        prismaClient.userCommunication.updateMany({
          data: {
            status: CommunicationMessageStatus.DELIVERED,
          },
          where: {
            id: {
              in: userCommunicationIds,
            },
          },
        }),
      )

      updatedCommunications += userCommunicationIds.length

      if (!queryLimit || (queryLimit && userCommunicationIds.length < queryLimit)) {
        hasMoreMessages = false
        logger.info(`Updated ${userCommunicationIds.length} messages. Finishing...`)
        return updatedCommunications
      } else {
        logger.info(
          `Updated ${userCommunicationIds.length} messages, next skipping ${updatedCommunications}`,
        )
      }
    }
  },
)
