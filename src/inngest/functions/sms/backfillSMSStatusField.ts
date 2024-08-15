import { SMSStatus } from '@prisma/client'
import { NonRetriableError } from 'inngest'

import { inngest } from '@/inngest/inngest'
import { onScriptFailure } from '@/inngest/onScriptFailure'
import { prismaClient } from '@/utils/server/prismaClient'

const BACKFILL_SMS_STATUS_FIELD_INNGEST_FUNCTION_ID = 'script.backfill-sms-status-field'
const BACKFILL_SMS_STATUS_FIELD_INNGEST_EVENT_NAME = 'script.backfill-sms-status-field'

const MAX_RETRY_COUNT = 0
const DATABASE_QUERY_LIMIT = Number(process.env.DATABASE_QUERY_LIMIT) || undefined

interface BackfillSMSStatusFieldPayload {
  smsStatus: SMSStatus
}

export const backfillSMSStatusField = inngest.createFunction(
  {
    id: BACKFILL_SMS_STATUS_FIELD_INNGEST_FUNCTION_ID,
    retries: MAX_RETRY_COUNT,
    onFailure: onScriptFailure,
  },
  {
    event: BACKFILL_SMS_STATUS_FIELD_INNGEST_EVENT_NAME,
  },
  async ({ step, event }) => {
    const { smsStatus } = event.data as BackfillSMSStatusFieldPayload

    const scenarios: Partial<
      Record<SMSStatus, { hasOptedInToSms: boolean; hasRepliedToOptInSms: boolean }>
    > = {
      [SMSStatus.OPTED_IN_HAS_REPLIED]: {
        hasOptedInToSms: true,
        hasRepliedToOptInSms: true,
      },
      [SMSStatus.OPTED_IN_PENDING_DOUBLE_OPT_IN]: {
        hasOptedInToSms: true,
        hasRepliedToOptInSms: false,
      },
      [SMSStatus.OPTED_OUT]: {
        hasOptedInToSms: false,
        hasRepliedToOptInSms: true,
      },
      [SMSStatus.NOT_OPTED_IN]: {
        hasOptedInToSms: false,
        hasRepliedToOptInSms: false,
      },
    }

    if (!scenarios[smsStatus]) {
      throw new NonRetriableError('Invalid sms status')
    }

    const { hasOptedInToSms, hasRepliedToOptInSms } = scenarios[smsStatus]!

    let hasNumbersLeft = true
    let cursor: string | undefined
    let totalUsers = 0

    while (hasNumbersLeft) {
      const userIds = await step.run('fetch-users', () =>
        prismaClient.user
          .findMany({
            skip: cursor ? 1 : undefined,
            take: DATABASE_QUERY_LIMIT,
            cursor: cursor
              ? {
                  id: cursor,
                }
              : undefined,
            where: {
              hasOptedInToSms,
              hasRepliedToOptInSms,
              smsStatus: 'NOT_OPTED_IN',
            },
            orderBy: {
              id: 'asc',
            },
            select: {
              id: true,
            },
          })
          .then(result => result.map(({ id }) => id)),
      )

      cursor = userIds.at(-1)
      const length = userIds.length

      totalUsers += length

      await step.run('update-users', () =>
        prismaClient.user.updateMany({
          data: {
            smsStatus,
          },
          where: {
            id: {
              in: userIds,
            },
          },
        }),
      )

      if ((DATABASE_QUERY_LIMIT && length < DATABASE_QUERY_LIMIT) || !DATABASE_QUERY_LIMIT) {
        hasNumbersLeft = false
      } else {
        await step.sleep('query-timeout', '30s')
      }
    }

    return `Updated ${totalUsers} users with smsStatus = ${smsStatus}`
  },
)
