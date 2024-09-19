import { SMSStatus } from '@prisma/client'
import { NonRetriableError } from 'inngest'

import { onFailureCapitolCanary } from '@/inngest/functions/capitolCanary/onFailureCapitolCanary'
import { inngest } from '@/inngest/inngest'
import {
  fetchAdvocatesFromCapitolCanary,
  formatCheckSMSOptInReplyRequest,
} from '@/utils/server/capitolCanary/fetchAdvocates'
import { prismaClient } from '@/utils/server/prismaClient'
import { getServerAnalytics } from '@/utils/server/serverAnalytics'
import { getLocalUserFromUser } from '@/utils/server/serverLocalUser'
import { smsProvider } from '@/utils/shared/smsProvider'

const CAPITOL_CANARY_CHECK_SMS_OPT_IN_REPLY_RETRY_LIMIT = 10

const CAPITOL_CANARY_CHECK_SMS_OPT_IN_REPLY_FUNCTION_ID = 'capitol-canary.check-sms-opt-in-reply'
export const CAPITOL_CANARY_CHECK_SMS_OPT_IN_REPLY_EVENT_NAME =
  'capitol.canary/check.sms.opt.in.reply'

const SLEEP_SCHEDULE = ['3m', '6m', '20m', '1h', '12h', '1d', '1d', '2d', '2d']

export const checkSMSOptInReplyWithInngest = inngest.createFunction(
  {
    id: CAPITOL_CANARY_CHECK_SMS_OPT_IN_REPLY_FUNCTION_ID,
    retries: CAPITOL_CANARY_CHECK_SMS_OPT_IN_REPLY_RETRY_LIMIT,
    onFailure: onFailureCapitolCanary,
  },
  { event: CAPITOL_CANARY_CHECK_SMS_OPT_IN_REPLY_EVENT_NAME },
  async ({ event, step }) => {
    const data = event.data

    const formattedRequest = formatCheckSMSOptInReplyRequest(data)
    if (formattedRequest instanceof Error) {
      throw new NonRetriableError(formattedRequest.message, {
        cause: formattedRequest,
      })
    }

    // Surround this in a step so that Inngest does not randomly re-emit the event.
    // There is a bug where `getLocalUserFromUser` cannot use the date from the payload user, hence the refetch here.
    await step.run('capitol-canary.check-sms-opt-in-reply.track-user-opt-in', async () => {
      const user = await prismaClient.user.findUniqueOrThrow({
        where: {
          id: data.user.id,
        },
      })
      await getServerAnalytics({
        localUser: getLocalUserFromUser(user),
        userId: data.user.id,
      })
        .track('User SMS Opt-In', {
          provider: smsProvider,
        })
        .flush()
    })

    for (const sleepTime of SLEEP_SCHEDULE) {
      await step.sleep(`sleep-${sleepTime}`, sleepTime)

      // In case the user does not have an advocate ID yet for some reason, we need to fetch it.
      if (!data.user.capitolCanaryAdvocateId) {
        const updatedUser = await step.run(
          `capitol-canary.check-sms-opt-in-reply.fetch-user-${sleepTime}`,
          async () => {
            return await prismaClient.user.findUniqueOrThrow({
              where: {
                id: data.user.id,
              },
            })
          },
        )
        if (updatedUser.capitolCanaryAdvocateId) {
          data.user.capitolCanaryAdvocateId = updatedUser.capitolCanaryAdvocateId
        } else {
          continue
        }
      }

      const advocates = await step.run(
        `capitol-canary.check-sms-opt-in-reply.fetch-advocates-${sleepTime}`,
        async () => {
          return fetchAdvocatesFromCapitolCanary(formattedRequest)
        },
      )
      for (const advocate of advocates.data) {
        // Multiple advocates can use the same phone number, so we are checking advocate ID.
        if (advocate.id !== data.user.capitolCanaryAdvocateId) {
          continue
        }
        for (const phone of advocate.phones) {
          if (phone.address === data.user.phoneNumber && phone.subscribed) {
            await step.run(
              'capitol-canary.check-sms-opt-in-reply.update-user-and-track-reply',
              async () => {
                await prismaClient.user.update({
                  where: { id: data.user.id },
                  data: {
                    smsStatus: SMSStatus.OPTED_IN_HAS_REPLIED,
                  },
                })
                // There is a bug where `getLocalUserFromUser` cannot use the date from the payload user, hence the refetch here.
                const user = await prismaClient.user.findUniqueOrThrow({
                  where: {
                    id: data.user.id,
                  },
                })
                await getServerAnalytics({
                  localUser: getLocalUserFromUser(user),
                  userId: data.user.id,
                })
                  .track('User Replied To SMS Opt-In')
                  .flush()
              },
            )
            return
          }
        }
      }
    }
  },
)
