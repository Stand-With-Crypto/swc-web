import { NonRetriableError } from 'inngest'

import { onFailureCapitolCanary } from '@/inngest/functions/capitolCanary/onFailureCapitolCanary'
import { inngest } from '@/inngest/inngest'
import {
  backfillCheckSMSOptInReplyRequest,
  fetchAdvocatesFromCapitolCanary,
} from '@/utils/server/capitolCanary/fetchAdvocates'
import { prismaClient } from '@/utils/server/prismaClient'

const CAPITOL_CANARY_BACKFILL_SMS_OPT_IN_REPLY_RETRY_LIMIT = 10

export const CAPITOL_CANARY_BACKFILL_SMS_OPT_IN_REPLY_FUNCTION_ID =
  'capitol-canary.backfill-sms-opt-in-reply'
export const CAPITOL_CANARY_BACKFILL_SMS_OPT_IN_REPLY_EVENT_NAME =
  'capitol.canary/backfill.sms.opt.in.reply'

export const backfillSMSOptInReplyWithInngest = inngest.createFunction(
  {
    id: CAPITOL_CANARY_BACKFILL_SMS_OPT_IN_REPLY_FUNCTION_ID,
    retries: CAPITOL_CANARY_BACKFILL_SMS_OPT_IN_REPLY_RETRY_LIMIT,
    onFailure: onFailureCapitolCanary,
  },
  { event: CAPITOL_CANARY_BACKFILL_SMS_OPT_IN_REPLY_EVENT_NAME },
  async ({ step }) => {
    const fetchRequest = backfillCheckSMSOptInReplyRequest({ page: 1 })
    if (fetchRequest instanceof Error) {
      throw new NonRetriableError(fetchRequest.message, {
        cause: fetchRequest,
      })
    }
    let advocates = await step.run(
      `capitol-canary.check-sms-opt-in-reply.fetch-advocates-${fetchRequest.page!}`,
      async () => {
        return fetchAdvocatesFromCapitolCanary(fetchRequest)
      },
    )

    let totalUsersProcessed = 0
    // Break condition.
    while (advocates.data.length > 0) {
      totalUsersProcessed += await step.run(
        `capitol-canary.check-sms-opt-in-reply.process-advocates-${fetchRequest.page!}`,
        async () => {
          let numUsersProcessed = 0
          for (const advocate of advocates.data) {
            const matchingUsers = await prismaClient.user.findMany({
              where: {
                capitolCanaryAdvocateId: advocate.id, // We only care about matching by advocate ID because the "SMS reply" flag is user-specific, not phone-number-specific.
              },
            })
            if (matchingUsers.length === 0) {
              continue
            }

            let hasRepliedToOptInSms = false
            for (const phone of advocate.phones) {
              if (phone.subscribed) {
                hasRepliedToOptInSms = true
                break
              }
            }
            if (!hasRepliedToOptInSms) {
              continue
            }

            await prismaClient.user.updateMany({
              where: {
                id: {
                  in: matchingUsers.map(user => user.id),
                },
              },
              data: {
                hasRepliedToOptInSms: true,
              },
            })
            numUsersProcessed += matchingUsers.length
          }
          return numUsersProcessed
        },
      )

      // Fetch next page.
      fetchRequest.page! += 1
      advocates = await step.run(
        `capitol-canary.check-sms-opt-in-reply.fetch-advocates-${fetchRequest.page!}`,
        async () => {
          return fetchAdvocatesFromCapitolCanary(fetchRequest)
        },
      )
    }

    return totalUsersProcessed
  },
)
