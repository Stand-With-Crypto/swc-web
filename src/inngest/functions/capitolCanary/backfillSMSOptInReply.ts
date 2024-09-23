import { SMSStatus } from '@prisma/client'
import { NonRetriableError } from 'inngest'

import { onFailureCapitolCanary } from '@/inngest/functions/capitolCanary/onFailureCapitolCanary'
import { inngest } from '@/inngest/inngest'
import {
  fetchAdvocatesFromCapitolCanary,
  FetchAdvocatesFromCapitolCanaryRequest,
  formatBackfillSMSOptInReplyRequest,
} from '@/utils/server/capitolCanary/fetchAdvocates'
import { prismaClient } from '@/utils/server/prismaClient'

const CAPITOL_CANARY_BACKFILL_SMS_OPT_IN_REPLY_RETRY_LIMIT = 10
const CAPITOL_CANARY_BACKFILL_SMS_OPT_IN_REPLY_PAGE_INTERVALS = 100

const CAPITOL_CANARY_BACKFILL_SMS_OPT_IN_REPLY_FUNCTION_ID =
  'capitol-canary.backfill-sms-opt-in-reply'
const CAPITOL_CANARY_BACKFILL_SMS_OPT_IN_REPLY_EVENT_NAME =
  'capitol.canary/backfill.sms.opt.in.reply'

export type CapitolCanaryBackfillSmsOptInReplySchema = {
  name: typeof CAPITOL_CANARY_BACKFILL_SMS_OPT_IN_REPLY_EVENT_NAME
}

/**
 * Fetches the advocates from Capitol Canary and returns the advocate IDs with subscribed phones.
 * We return the minimal information instead of returning the full advocate payload from the step functions because
 *   there is a 4MB memory limit for Inngest functions in which the memory usage is summed across all steps in a function.
 *
 * @param request
 * @returns if there are advocates for a page and the advocate IDs with subscribed phones
 */
async function fetchMinimalSMSAdvocatesFromCapitolCanary(
  request: FetchAdvocatesFromCapitolCanaryRequest,
) {
  const fullAdvocates = await fetchAdvocatesFromCapitolCanary(request)
  const minimalAdvocateInformation: {
    hasAdvocatesForPage: boolean
    advocateIdsWithSubscribedPhones: number[]
  } = { hasAdvocatesForPage: false, advocateIdsWithSubscribedPhones: [] }

  if (fullAdvocates.data.length > 0) {
    minimalAdvocateInformation.hasAdvocatesForPage = true
  } else {
    return minimalAdvocateInformation
  }

  for (const fullAdvocate of fullAdvocates.data) {
    for (const phone of fullAdvocate.phones) {
      if (phone.subscribed) {
        minimalAdvocateInformation.advocateIdsWithSubscribedPhones.push(fullAdvocate.id)
        break
      }
    }
  }

  return minimalAdvocateInformation
}

/**
 * This function is used to backfill the `smsStatus` field for users who have replied to the SMS opt-in message.
 * We fan-out the process in page intervals of 100, where each batch will process 10500 advocates. We process each batch in parallel.
 * Fanning-out is performed to avoid hitting the 1000 step limit per Inngest function.
 */
export const backfillSMSOptInReplyWithInngest = inngest.createFunction(
  {
    id: CAPITOL_CANARY_BACKFILL_SMS_OPT_IN_REPLY_FUNCTION_ID,
    retries: CAPITOL_CANARY_BACKFILL_SMS_OPT_IN_REPLY_RETRY_LIMIT,
    onFailure: onFailureCapitolCanary,
  },
  { event: CAPITOL_CANARY_BACKFILL_SMS_OPT_IN_REPLY_EVENT_NAME },
  async ({ step }) => {
    const fetchRequest = formatBackfillSMSOptInReplyRequest({ page: 1 })
    if (fetchRequest instanceof Error) {
      throw new NonRetriableError(fetchRequest.message, {
        cause: fetchRequest,
      })
    }
    let hasAdvocatesForPage = await step.run(
      `capitol-canary.backfill-sms-opt-in-reply.check-advocates-for-page-${fetchRequest.page!}`,
      async () => {
        const fullAdvocates = await fetchAdvocatesFromCapitolCanary(fetchRequest)
        if (fullAdvocates.data.length > 0) {
          return true
        }
        return false
      },
    )

    while (hasAdvocatesForPage) {
      await step.sendEvent(
        `capitol-canary.backfill-sms-opt-in-reply.send-batch-for-page-${fetchRequest.page!}`,
        {
          name: CAPITOL_CANARY_BACKFILL_SMS_OPT_IN_REPLY_UPDATE_BATCH_OF_USERS_EVENT_NAME,
          data: {
            page: fetchRequest.page!,
          },
        },
      )

      fetchRequest.page! += CAPITOL_CANARY_BACKFILL_SMS_OPT_IN_REPLY_PAGE_INTERVALS
      hasAdvocatesForPage = await step.run(
        `capitol-canary.backfill-sms-opt-in-reply.check-advocates-for-page-${fetchRequest.page!}`,
        async () => {
          const fullAdvocates = await fetchAdvocatesFromCapitolCanary(fetchRequest)
          if (fullAdvocates.data.length > 0) {
            return true
          }
          return false
        },
      )
    }
  },
)

const CAPITOL_CANARY_BACKFILL_SMS_OPT_IN_REPLY_PAGES_FOR_BATCH = 105

const CAPITOL_CANARY_BACKFILL_SMS_OPT_IN_REPLY_UPDATE_BATCH_OF_USERS_FUNCTION_ID =
  'capitol-canary.backfill-sms-opt-in-reply.update-batch-of-users'
const CAPITOL_CANARY_BACKFILL_SMS_OPT_IN_REPLY_UPDATE_BATCH_OF_USERS_EVENT_NAME =
  'capitol.canary/backfill.sms.opt.in.reply/update.batch.of.users'

export type CapitolCanaryBackfillSmsOptInReplyUpdateBatchOfUsersSchema = {
  name: typeof CAPITOL_CANARY_BACKFILL_SMS_OPT_IN_REPLY_UPDATE_BATCH_OF_USERS_EVENT_NAME
  data: {
    page: number
  }
}

/**
 * In case you want to process a specific batch of users, you can use this function.
 * Just pass in `page` as a data parameter in the event.
 */
export const backfillSMSOptInReplyWithInngestUpdateBatchOfUsers = inngest.createFunction(
  {
    id: CAPITOL_CANARY_BACKFILL_SMS_OPT_IN_REPLY_UPDATE_BATCH_OF_USERS_FUNCTION_ID,
    retries: CAPITOL_CANARY_BACKFILL_SMS_OPT_IN_REPLY_RETRY_LIMIT,
    onFailure: onFailureCapitolCanary,
  },
  { event: CAPITOL_CANARY_BACKFILL_SMS_OPT_IN_REPLY_UPDATE_BATCH_OF_USERS_EVENT_NAME },
  async ({ event, step }) => {
    const initialPage = event.data.page as number
    const pageOffset = initialPage
    const fetchRequest = formatBackfillSMSOptInReplyRequest({ page: initialPage })
    if (fetchRequest instanceof Error) {
      throw new NonRetriableError(fetchRequest.message, {
        cause: fetchRequest,
      })
    }
    let minimalAdvocates = await step.run(
      `capitol-canary.backfill-sms-opt-in-reply.fetch-minimal-advocates-for-page-${fetchRequest.page!}`,
      async () => {
        return fetchMinimalSMSAdvocatesFromCapitolCanary(fetchRequest)
      },
    )

    let totalUsersProcessed = 0
    while (
      minimalAdvocates.hasAdvocatesForPage &&
      fetchRequest.page! - pageOffset < CAPITOL_CANARY_BACKFILL_SMS_OPT_IN_REPLY_PAGES_FOR_BATCH
    ) {
      totalUsersProcessed += await step.run(
        `capitol-canary.backfill-sms-opt-in-reply.process-advocates-for-page-${fetchRequest.page!}`,
        async () => {
          if (minimalAdvocates.advocateIdsWithSubscribedPhones.length === 0) {
            return 0
          }
          await prismaClient.user.updateMany({
            where: {
              capitolCanaryAdvocateId: {
                in: minimalAdvocates.advocateIdsWithSubscribedPhones, // We only care about matching by advocate ID because the "SMS reply" flag is user-specific, not phone-number-specific.
              },
            },
            data: {
              smsStatus: SMSStatus.OPTED_IN_HAS_REPLIED,
            },
          })
          return minimalAdvocates.advocateIdsWithSubscribedPhones.length
        },
      )

      fetchRequest.page! += 1
      minimalAdvocates = await step.run(
        `capitol-canary.backfill-sms-opt-in-reply.fetch-minimal-advocates-for-page-${fetchRequest.page!}`,
        async () => {
          return fetchMinimalSMSAdvocatesFromCapitolCanary(fetchRequest)
        },
      )
    }

    return totalUsersProcessed
  },
)
