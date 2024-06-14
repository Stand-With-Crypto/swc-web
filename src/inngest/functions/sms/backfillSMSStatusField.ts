import { inngest } from '@/inngest/inngest'
import { prismaClient } from '@/utils/server/prismaClient'

const BACKFILL_SMS_STATUS_FIELD_INNGEST_FUNCTION_ID = 'script.backfill-sms-status-field'
const BACKFILL_SMS_STATUS_FIELD_INNGEST_EVENT_NAME = 'script.backfill-sms-status-field'

export const backfillSMSStatusField = inngest.createFunction(
  {
    id: BACKFILL_SMS_STATUS_FIELD_INNGEST_FUNCTION_ID,
    retries: 0,
  },
  {
    event: BACKFILL_SMS_STATUS_FIELD_INNGEST_EVENT_NAME,
  },
  async ({ step }) => {
    // OPTED_IN -> hasOptedInToSms === true && hasRepliedToOptInSms === true
    await step.run('backfill-sms-status.OPTED_IN', () => {
      return prismaClient.user.updateMany({
        where: {
          hasOptedInToSms: true,
          hasRepliedToOptInSms: true,
        },
        data: {
          smsStatus: 'OPTED_IN',
        },
      })
    })

    // OPTED_IN_PENDING_DOUBLE_OPT_IN -> hasOptedInToSms === true && hasRepliedToOptInSms === false
    await step.run('backfill-sms-status.OPTED_IN_PENDING_DOUBLE_OPT_IN', () => {
      return prismaClient.user.updateMany({
        where: {
          hasOptedInToSms: true,
          hasRepliedToOptInSms: false,
        },
        data: {
          smsStatus: 'OPTED_IN_PENDING_DOUBLE_OPT_IN',
        },
      })
    })

    // OPTED_OUT -> hasOptedInToSms === false && hasRepliedToOptInSms === true
    await step.run('backfill-sms-status.OPTED_OUT', () => {
      return prismaClient.user.updateMany({
        where: {
          hasOptedInToSms: false,
          hasRepliedToOptInSms: true,
        },
        data: {
          smsStatus: 'OPTED_OUT',
        },
      })
    })
  },
)
