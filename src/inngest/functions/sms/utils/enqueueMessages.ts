import { UserCommunicationJourneyType } from '@prisma/client'
import * as Sentry from '@sentry/node'

import { sendSMS, SendSMSError } from '@/utils/server/sms'
import { sleep } from '@/utils/shared/sleep'

import { createCommunication, createCommunicationJourneys, flagInvalidPhoneNumbers } from '.'

const ENQUEUE_MAX_RETRY_ATTEMPTS = 5

export async function enqueueMessages(phoneNumbers: string[], body: string, attempt = 0) {
  if (attempt > ENQUEUE_MAX_RETRY_ATTEMPTS) return 0

  const enqueueMessagesPromise = phoneNumbers.map(async phoneNumber => {
    const communicationJourneys = await createCommunicationJourneys(
      phoneNumber,
      UserCommunicationJourneyType.BULK_SMS,
    )

    const message = await sendSMS({
      body,
      to: phoneNumber,
    })

    if (message) {
      await createCommunication(communicationJourneys, message.sid)
    }

    return message
  })

  const failedPhoneNumbers: string[] = []
  const invalidPhoneNumbers: string[] = []

  let messagesSent = 0
  await Promise.allSettled(enqueueMessagesPromise).then(results => {
    results.forEach(result => {
      if (result.status === 'rejected') {
        if (result.reason instanceof SendSMSError) {
          if (result.reason.isTooManyRequests) {
            failedPhoneNumbers.push(result.reason.phoneNumber)
          } else if (result.reason.isInvalidPhoneNumber) {
            invalidPhoneNumbers.push(result.reason.phoneNumber)
          } else {
            Sentry.captureException('Unexpected sendSMS error', {
              extra: { reason: result.reason },
              tags: {
                domain: 'bulkSMS',
              },
            })
          }
        } else {
          Sentry.captureException('sendSMS failed with no reason', {
            extra: {
              reason: result.reason,
            },
            tags: {
              domain: 'bulkSMS',
            },
          })
        }
      } else {
        messagesSent += 1
      }
    })
  })

  if (invalidPhoneNumbers.length > 0) {
    await flagInvalidPhoneNumbers(invalidPhoneNumbers)
  }

  // exponential backoff retry
  if (failedPhoneNumbers.length > 0) {
    await sleep(10000 * (attempt + 1))

    messagesSent += await enqueueMessages(failedPhoneNumbers, body, attempt + 1)
  }

  return messagesSent
}
