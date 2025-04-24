import { UserCommunicationJourneyType } from '@prisma/client'
import * as Sentry from '@sentry/node'
import { NonRetriableError } from 'inngest'
import { update } from 'lodash-es'

import { flagInvalidPhoneNumbers } from '@/inngest/functions/sms/utils/flagInvalidPhoneNumbers'
import { getSMSVariablesByPhoneNumbers } from '@/inngest/functions/sms/utils/getSMSVariablesByPhoneNumbers'
import { inngest } from '@/inngest/inngest'
import { sendSMS, SendSMSError, TWILIO_RATE_LIMIT } from '@/utils/server/sms'
import { optOutUser } from '@/utils/server/sms/actions'
import {
  countSegments,
  getUserByPhoneNumber,
  getCountryCodeFromPhoneNumber,
} from '@/utils/server/sms/utils'
import { applySMSVariables, UserSMSVariables } from '@/utils/server/sms/utils/variables'
import { getLogger } from '@/utils/shared/logger'
import {
  DEFAULT_SUPPORTED_COUNTRY_CODE,
  SupportedCountryCodes,
} from '@/utils/shared/supportedCountries'
import { apiUrls, fullUrl } from '@/utils/shared/urls'
import { isSmsSupportedInCountry } from '@/utils/shared/sms/smsSupportedCountries'

export const ENQUEUE_SMS_INNGEST_EVENT_NAME = 'app/enqueue.sms'
const ENQUEUE_SMS_INNGEST_FUNCTION_ID = 'app.enqueue-sms'

const MAX_RETRY_COUNT = 0

export interface EnqueueMessagePayload {
  phoneNumber: string
  messages: Array<{
    body: string
    journeyType: UserCommunicationJourneyType
    campaignName: string
    media?: string[]
    hasWelcomeMessageInBody?: boolean
  }>
}

export interface EnqueueSMSInngestEventSchema {
  name: typeof ENQUEUE_SMS_INNGEST_EVENT_NAME
  data: {
    payload: EnqueueMessagePayload[]
    variables?: EnqueueMessagesVariables
    countryCode?: SupportedCountryCodes
    attempt?: number
  }
}

export const enqueueSMS = inngest.createFunction(
  {
    id: ENQUEUE_SMS_INNGEST_FUNCTION_ID,
    retries: MAX_RETRY_COUNT,
  },
  {
    event: ENQUEUE_SMS_INNGEST_EVENT_NAME,
  },
  async ({ event, step, logger }) => {
    const {
      payload,
      variables,
      attempt = 0,
      countryCode = DEFAULT_SUPPORTED_COUNTRY_CODE,
    } = event.data

    if (payload.length > TWILIO_RATE_LIMIT) {
      throw new NonRetriableError('Payload exceeds the limit allowed')
    }

    // This function has a built-in mechanism that retries only failed messages
    if (attempt >= 5) {
      return {
        queuedMessages: 0,
        segmentsSent: 0,
      }
    }

    // This mechanism reuses previous variables to save an Inngest step
    let userSMSVariables = variables
    if (!userSMSVariables) {
      logger.info('Fetching variables')

      userSMSVariables = await step.run('fetch-variables', () =>
        getSMSVariablesByPhoneNumbers(payload.map(({ phoneNumber }) => phoneNumber)),
      )
    }

    let totalQueuedMessages = 0
    let totalSegmentsSent = 0

    logger.info(`Attempt ${attempt + 1} queuing messages`)

    const enqueueMessagesResults = await step.run('enqueue-messages', () =>
      enqueueMessages(payload, userSMSVariables, countryCode),
    )

    const {
      // Phone numbers that sendSMS returned a isTooManyRequests error. Messages are grouped by phone number. Ex: [{ [phoneNumber]: [failedMessageInfo] }]
      failedPhoneNumbers,
      queuedMessages,
      segmentsSent,
    } = enqueueMessagesResults

    logger.info(
      `Attempt ${attempt + 1} queued ${queuedMessages} messages (${segmentsSent} segments)`,
    )

    await step.run('persist-results-to-db', () =>
      persistEnqueueMessagesResults(enqueueMessagesResults, logger, countryCode),
    )

    totalQueuedMessages += queuedMessages
    totalSegmentsSent += segmentsSent

    // Here we're creating the payload for the next execution of enqueueSMS, only with failed messages
    const failedEnqueueMessagePayload: EnqueueMessagePayload[] = Object.keys(
      failedPhoneNumbers,
    ).map(phoneNumber => ({
      phoneNumber,
      messages: failedPhoneNumbers[phoneNumber],
    }))

    if (failedEnqueueMessagePayload.length > 0) {
      const waitingTime = 1000 * (attempt * attempt)

      logger.info(
        `Failed to send SMS to ${failedEnqueueMessagePayload.length} phone numbers. Attempting again in ${waitingTime} millisecond`,
      )

      await step.sleep('wait-to-retry-failing-messages', waitingTime)

      const queuedFailedMessages = await step.invoke('enqueue-failed-messages', {
        function: enqueueSMS,
        data: {
          countryCode,
          payload: failedEnqueueMessagePayload,
          attempt: attempt + 1,
          variables: userSMSVariables,
        },
      })

      totalQueuedMessages += queuedFailedMessages.queuedMessages
      totalSegmentsSent += queuedFailedMessages.segmentsSent
    }

    return {
      queuedMessages: totalQueuedMessages,
      segmentsSent: totalSegmentsSent,
    }
  },
)

type EnqueueMessagesVariables = Record<string, UserSMSVariables>

export async function enqueueMessages(
  payload: EnqueueMessagePayload[],
  variables: EnqueueMessagesVariables,
  countryCode: SupportedCountryCodes,
) {
  const invalidPhoneNumbers: string[] = []
  const failedPhoneNumbers: Record<string, EnqueueMessagePayload['messages']> = {}
  const unsubscribedUsers: string[] = []

  let segmentsSent = 0
  let queuedMessages = 0

  const enqueueMessagesPromise = payload
    .map(async ({ messages, phoneNumber }) => {
      const phoneNumberCountryCode = getCountryCodeFromPhoneNumber(phoneNumber)

      if (!phoneNumberCountryCode || !isSmsSupportedInCountry(phoneNumberCountryCode)) {
        return
      }

      for (const message of messages) {
        const { body, journeyType, campaignName, media, hasWelcomeMessageInBody } = message

        const phoneNumberVariables = variables[phoneNumber] ?? {}

        try {
          const queuedMessage = await sendSMS({
            body: applySMSVariables(body, phoneNumberVariables),
            to: phoneNumber,
            media,
            statusCallbackUrl: fullUrl(
              apiUrls.smsStatusCallback({
                journeyType,
                campaignName,
                hasWelcomeMessageInBody,
              }),
            ),
          })

          if (queuedMessage) {
            segmentsSent += countSegments(queuedMessage.body)
            queuedMessages += 1
          }
        } catch (error) {
          if (error instanceof NonRetriableError) {
            throw error
          }

          if (error instanceof SendSMSError) {
            if (error.isTooManyRequests) {
              return update(failedPhoneNumbers, [error.phoneNumber], (current = []) => [
                ...current,
                message,
              ])
            }
            if (error.isInvalidPhoneNumber) {
              return invalidPhoneNumbers.push(error.phoneNumber)
            }
            if (error.isUnsubscribedUser) {
              return unsubscribedUsers.push(error.phoneNumber)
            }

            return Sentry.captureException(`sendSMS Error ${error.code}: ${error.message}`, {
              extra: { reason: error },
              tags: {
                domain: 'enqueueMessages',
              },
            })
          }

          Sentry.captureException(`sendSMS unexpected Error: ${(error as any)?.message}`, {
            extra: {
              reason: error,
            },
            tags: {
              domain: 'enqueueMessages',
            },
          })
        }
      }
    })
    .filter(Boolean)

  await Promise.all(enqueueMessagesPromise)

  return {
    invalidPhoneNumbers,
    failedPhoneNumbers,
    unsubscribedUsers,
    segmentsSent,
    queuedMessages,
  }
}

const defaultLogger = getLogger('persistEnqueueMessagesResults')

export async function persistEnqueueMessagesResults(
  { invalidPhoneNumbers, unsubscribedUsers }: Awaited<ReturnType<typeof enqueueMessages>>,
  logger = defaultLogger,
  countryCode = DEFAULT_SUPPORTED_COUNTRY_CODE,
) {
  if (invalidPhoneNumbers.length > 0) {
    logger.info(`Found ${invalidPhoneNumbers.length} invalid phone numbers`)
    await flagInvalidPhoneNumbers(invalidPhoneNumbers)

    logger.info(`Invalid phone numbers flagged`)
  }

  if (unsubscribedUsers.length > 0) {
    logger.info(`Found ${unsubscribedUsers.length} unsubscribed users`)
    const optOutUserPromises = unsubscribedUsers.map(async phoneNumber => {
      const user = await getUserByPhoneNumber(phoneNumber)

      await optOutUser({ phoneNumber, user, countryCode })
    })

    await Promise.all(optOutUserPromises)

    logger.info(`Opted out ${unsubscribedUsers.length} users`)
  }
}
