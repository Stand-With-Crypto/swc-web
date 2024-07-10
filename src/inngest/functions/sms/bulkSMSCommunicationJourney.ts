import { Prisma, SMSStatus, UserCommunicationJourneyType } from '@prisma/client'
import { NonRetriableError } from 'inngest'
import { chunk } from 'lodash-es'

import { validatePhoneNumber } from '@/inngest/functions/sms/shared/validatePhoneNumber'
import { inngest } from '@/inngest/inngest'
import { onScriptFailure } from '@/inngest/onScriptFailure'
import { prismaClient } from '@/utils/server/prismaClient'
import { countSegments, sendSMS } from '@/utils/server/sms'
import { getLogger } from '@/utils/shared/logger'

import { createCommunication, createCommunicationJourneys } from './shared/communicationJourney'

export const BULK_SMS_COMMUNICATION_JOURNEY_INNGEST_EVENT_NAME = 'app/user.communication/bulk.sms'

export const BULK_SMS_COMMUNICATION_JOURNEY_INNGEST_FUNCTION_ID = 'user-communication/bulk-sms'

const MAX_RETRY_COUNT = 3
const MPS = 3

const logger = getLogger('bulk-sms')

interface BulkSMSCommunicationJourneyPayload {
  smsBody: string
  userWhereInput?: Prisma.UserFindManyArgs['where']
}

export const bulkSMSCommunicationJourney = inngest.createFunction(
  {
    id: BULK_SMS_COMMUNICATION_JOURNEY_INNGEST_FUNCTION_ID,
    retries: MAX_RETRY_COUNT,
    onFailure: onScriptFailure,
  },
  {
    event: BULK_SMS_COMMUNICATION_JOURNEY_INNGEST_EVENT_NAME,
  },
  async ({ step, event }) => {
    const { smsBody, userWhereInput } = event.data as BulkSMSCommunicationJourneyPayload

    if (!smsBody) {
      throw new NonRetriableError('Missing sms body')
    }

    const segmentsCount = countSegments(smsBody)

    const userBatches = await step.run('fetch-users', async () => {
      const phoneNumbers = await prismaClient.user.groupBy({
        by: 'phoneNumber',
        where: {
          ...userWhereInput,
          smsStatus: {
            in: [
              SMSStatus.OPTED_IN,
              SMSStatus.OPTED_IN_HAS_REPLIED,
              SMSStatus.OPTED_IN_PENDING_DOUBLE_OPT_IN,
            ],
          },
        },
        having: {
          phoneNumber: {
            not: '',
          },
        },
        orderBy: {
          phoneNumber: 'asc',
        },
      })

      const validPhoneNumbers = await Promise.all(
        phoneNumbers.map(async ({ phoneNumber }) => {
          try {
            await validatePhoneNumber(phoneNumber)
            return phoneNumber
          } catch (error) {
            return null
          }
        }),
      )

      const filteredPhoneNumbers = validPhoneNumbers.filter(
        phoneNumber => phoneNumber !== null,
      ) as string[]

      const filteredOutCount = phoneNumbers.length - filteredPhoneNumbers.length

      const timeInSecondsToSendAllMessages = (filteredPhoneNumbers.length / MPS) * segmentsCount

      const batches = chunk(filteredPhoneNumbers, MPS)

      logger.info(`
        - Message has ${segmentsCount} segments
        - Got ${phoneNumbers.length} phone numbers
        - ${filteredOutCount} are invalid
        - Sending the message to ${filteredPhoneNumbers.length} numbers
        - Divided into ${batches.length} batches of ${MPS} numbers
        - Will take ~ ${formatTime(timeInSecondsToSendAllMessages)}
      `)

      return batches
    })

    let batchNum = 1
    let messageCount = 0
    for (const batch of userBatches) {
      await Promise.all(
        batch.map((phoneNumber, index) =>
          step.run(`send-sms-${batchNum}:${index + 1}`, async () => {
            const communicationJourneys = await createCommunicationJourneys(
              phoneNumber,
              UserCommunicationJourneyType.BULK_SMS,
            )

            const message = await sendSMS({
              body: smsBody,
              to: phoneNumber,
            })

            if (message) {
              messageCount += 1
              await createCommunication(communicationJourneys, message.sid)
            }
          }),
        ),
      )

      batchNum += 1
      await step.sleep(`script.sleep-${batchNum}`, 1000 * segmentsCount)
    }

    logger.info(`Finished! Sent ${messageCount} messages`)
  },
)

function formatTime(seconds: number) {
  if (seconds < 60) {
    return `${seconds.toPrecision(2)} seconds`
  } else if (seconds < 3600) {
    // less than 60 minutes (3600 seconds)
    const minutes = Math.ceil(seconds / 60)
    return `${minutes} minutes`
  } else if (seconds < 86400) {
    // less than 24 hours (86400 seconds)
    const hours = Math.ceil(seconds / 3600)
    return `${hours} hours`
  } else {
    // 24 hours or more
    const days = Math.ceil(seconds / 86400)
    return `${days} days`
  }
}
