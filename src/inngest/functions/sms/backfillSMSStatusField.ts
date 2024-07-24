import { SMSStatus } from '@prisma/client'

import { fetchPhoneNumbers } from '@/inngest/functions/sms/utils'
import { inngest } from '@/inngest/inngest'
import { onScriptFailure } from '@/inngest/onScriptFailure'
import { prismaClient } from '@/utils/server/prismaClient'
import { getLogger } from '@/utils/shared/logger'

const BACKFILL_SMS_STATUS_FIELD_INNGEST_FUNCTION_ID = 'script.backfill-sms-status-field'
const BACKFILL_SMS_STATUS_FIELD_INNGEST_EVENT_NAME = 'script.backfill-sms-status-field'

const MAX_RETRY_COUNT = 0
const DATABASE_QUERY_LIMIT = process.env.DATABASE_QUERY_LIMIT
  ? Number(process.env.DATABASE_QUERY_LIMIT)
  : undefined

const logger = getLogger('backfillSMSStatusField')

interface BackfillSMSStatusFieldPayload {
  persist?: boolean
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
    const { persist } = event.data as BackfillSMSStatusFieldPayload

    const scenarios = [
      {
        hasOptedInToSms: true,
        hasRepliedToOptInSms: true,
        smsStatus: SMSStatus.OPTED_IN_HAS_REPLIED,
      },
      {
        hasOptedInToSms: true,
        hasRepliedToOptInSms: false,
        smsStatus: SMSStatus.OPTED_IN_PENDING_DOUBLE_OPT_IN,
      },
      {
        hasOptedInToSms: false,
        hasRepliedToOptInSms: true,
        smsStatus: SMSStatus.OPTED_OUT,
      },
    ]

    for (const { hasOptedInToSms, hasRepliedToOptInSms, smsStatus } of scenarios) {
      await step.run(
        `updating-sms-status-${smsStatus.toLowerCase().replaceAll('_', '-')}`,
        async () => {
          let hasNumbersLest = true
          let outerCursor: Date | undefined
          let totalUsers = 0
          let iteration = 0

          logger.info(`SmsStatus: ${smsStatus}`)

          while (hasNumbersLest) {
            logger.info(`Iteration ${iteration}`)

            logger.info(`Fetching...`)

            const [phoneNumberChunks, newCursor, length] = await fetchPhoneNumbers(
              (take, cursor = outerCursor) =>
                prismaClient.user.findMany({
                  where: {
                    hasOptedInToSms,
                    hasRepliedToOptInSms,
                    datetimeCreated: {
                      gt: cursor,
                    },
                  },
                  take,
                  orderBy: {
                    datetimeCreated: 'asc',
                  },
                }),
              {
                maxLength: DATABASE_QUERY_LIMIT,
              },
            )

            outerCursor = newCursor
            totalUsers += length

            if (persist) {
              logger.info(`Updating ${length} users...`)

              for (const chunk of phoneNumberChunks) {
                await prismaClient.user.updateMany({
                  where: {
                    phoneNumber: {
                      in: chunk,
                    },
                  },
                  data: {
                    smsStatus,
                  },
                })
              }
            }

            if ((DATABASE_QUERY_LIMIT && length < DATABASE_QUERY_LIMIT) || !DATABASE_QUERY_LIMIT) {
              hasNumbersLest = false
            }

            iteration += 1
          }

          logger.info(`Finished! Found ${totalUsers} users with smsStatus: ${smsStatus}`)

          return { updated: totalUsers }
        },
      )

      await step.sleep('query-timeout', '30s')
    }
  },
)
