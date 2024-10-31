import { faker } from '@faker-js/faker'
import { describe, expect, it } from '@jest/globals'
import { update } from 'lodash-es'

import {
  EnqueueMessagePayload,
  enqueueMessages,
  persistEnqueueMessagesResults,
} from '@/inngest/functions/sms/enqueueMessages'
import { bulkCreateCommunicationJourney } from '@/inngest/functions/sms/utils/communicationJourney'
import { countMessagesAndSegments } from '@/inngest/functions/sms/utils/countMessagesAndSegments'
import { flagInvalidPhoneNumbers } from '@/inngest/functions/sms/utils/flagInvalidPhoneNumbers'
import { fakerFields } from '@/mocks/fakerUtils'
import { sendSMS, SendSMSError } from '@/utils/server/sms'
import { optOutUser } from '@/utils/server/sms/actions'
import type { SendSMSPayload } from '@/utils/server/sms/sendSMS'
import {
  INVALID_PHONE_NUMBER_CODE,
  IS_UNSUBSCRIBED_USER_CODE,
  TOO_MANY_REQUESTS_CODE,
} from '@/utils/server/sms/SendSMSError'
import { UserSMSVariables } from '@/utils/server/sms/utils/variables'
import { apiUrls, fullUrl } from '@/utils/shared/urls'

jest.mock('@/inngest/functions/sms/utils/flagInvalidPhoneNumbers', () => ({
  flagInvalidPhoneNumbers: jest.fn(),
}))

jest.mock('@/inngest/functions/sms/utils/communicationJourney', () => ({
  bulkCreateCommunicationJourney: jest.fn(),
}))

jest.mock('@/inngest/functions/sms/utils/getSMSVariablesByPhoneNumbers', () => ({
  getSMSVariablesByPhoneNumbers: jest.fn().mockImplementation(() => Promise.resolve({})),
}))

jest.mock('@/utils/server/sms/utils', () => ({
  ...jest.requireActual('@/utils/server/sms/utils/countSegments'),
  getUserByPhoneNumber: jest.fn(),
}))

jest.mock('@/utils/server/sms/actions', () => ({
  optOutUser: jest.fn(),
}))

type SendSMSResponse = Partial<Awaited<ReturnType<typeof sendSMS>>>

jest.mock('@/utils/server/sms', () => ({
  ...jest.requireActual('@/utils/server/sms'),
  sendSMS: jest.fn().mockImplementation(({ body }: SendSMSPayload) =>
    Promise.resolve<SendSMSResponse>({
      body,
      sid: faker.string.uuid(),
    }),
  ),
}))

const randomArray = <T>(generator: () => T, length?: number) =>
  Array.from({ length: length ?? faker.number.int({ min: 5, max: 15 }) }).map(generator)

describe('enqueueMessages', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  const mockedPayload = randomArray<EnqueueMessagePayload>(() => ({
    phoneNumber: fakerFields.phoneNumber(),
    messages: randomArray(() => ({
      journeyType: 'BULK_SMS',
      body: faker.string.alpha(10),
      campaignName: 'unit-tests',
    })),
  }))

  const mockSMSVariables = (): UserSMSVariables => ({
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
    sessionId: faker.helpers.maybe(faker.string.uuid),
    userId: faker.string.uuid(),
  })

  const mockedPayloadVariables: Record<string, UserSMSVariables> = mockedPayload.reduce(
    (acc, curr) => update(acc, [curr.phoneNumber], mockSMSVariables),
    {},
  )

  it('should call sendSMS with each phone number', async () => {
    await enqueueMessages(mockedPayload, mockedPayloadVariables)

    const totalMessages = mockedPayload.reduce((acc, curr) => acc + curr.messages.length, 0)

    expect(sendSMS).toBeCalledTimes(totalMessages)
    mockedPayload.forEach(({ messages, phoneNumber }) =>
      messages.forEach(({ body, media, campaignName, journeyType }) =>
        expect(sendSMS).toBeCalledWith({
          to: phoneNumber,
          body,
          media,
          statusCallbackUrl: fullUrl(
            apiUrls.smsStatusCallback({
              journeyType,
              campaignName,
              userId: mockedPayloadVariables[phoneNumber].userId,
            }),
          ),
        }),
      ),
    )
  })

  it('should return the exact number of messages sent', async () => {
    const { messages, segments } = countMessagesAndSegments(mockedPayload)

    const { queuedMessages, segmentsSent } = await enqueueMessages(
      mockedPayload,
      mockedPayloadVariables,
    )

    expect(queuedMessages).toBe(messages)
    expect(segmentsSent).toBe(segments)
  })

  it('should handle sendSMS error scenarios', async () => {
    const invalidPhoneNumber = mockedPayload[0].phoneNumber
    const unsubscribedPhoneNumber = mockedPayload[1].phoneNumber
    const failedPhoneNumber = mockedPayload[2].phoneNumber

    const phoneNumbersThatShouldThrowErrors = {
      [invalidPhoneNumber]: INVALID_PHONE_NUMBER_CODE,
      [unsubscribedPhoneNumber]: IS_UNSUBSCRIBED_USER_CODE,
      [failedPhoneNumber]: TOO_MANY_REQUESTS_CODE,
    }

    ;(sendSMS as jest.Mock).mockImplementation(({ to, body }: SendSMSPayload) => {
      if (phoneNumbersThatShouldThrowErrors[to]) {
        return Promise.reject(new SendSMSError({ code: phoneNumbersThatShouldThrowErrors[to] }, to))
      }
      return Promise.resolve<Partial<Awaited<ReturnType<typeof sendSMS>>>>({
        body,
        sid: faker.string.uuid(),
      })
    })

    const { invalidPhoneNumbers, failedPhoneNumbers, unsubscribedUsers } = await enqueueMessages(
      mockedPayload,
      mockedPayloadVariables,
    )

    expect(invalidPhoneNumbers).toContain(invalidPhoneNumber)
    expect(unsubscribedUsers).toContain(unsubscribedPhoneNumber)
    expect(Object.keys(failedPhoneNumbers)).toContain(failedPhoneNumber)
  })

  const mockedVariables = mockSMSVariables()

  it.each([
    [
      `Please, finish your profile at ${fullUrl(`/profile?sessionId=<%= sessionId %>`)}`,
      `Please, finish your profile at ${fullUrl(`/profile?sessionId=${mockedVariables.sessionId ?? ''}`)}`,
    ],
    [
      `<%= firstName %> <%= lastName %>, thanks for subscribing to Stand With Crypto`,
      `${mockedVariables.firstName ?? ''} ${mockedVariables.lastName ?? ''}, thanks for subscribing to Stand With Crypto`,
    ],
    ['Message with no variables', 'Message with no variables'],
  ])('should correctly parse the sms body with custom variables', async (input, output) => {
    const phoneNumber = fakerFields.phoneNumber()

    const journeyType = 'BULK_SMS'
    const campaignName = 'unit-tests'

    await enqueueMessages(
      [
        {
          messages: [{ body: input, journeyType, campaignName }],
          phoneNumber,
        },
      ],
      {
        [phoneNumber]: mockedVariables,
      },
    )

    expect(sendSMS).toHaveBeenCalledWith({
      body: output,
      to: phoneNumber,
      statusCallbackUrl: fullUrl(
        apiUrls.smsStatusCallback({
          journeyType,
          campaignName,
          userId: mockedVariables.userId,
        }),
      ),
    })
  })
})

describe('persistEnqueueMessagesResults', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  const mockedPayload: Parameters<typeof persistEnqueueMessagesResults>['0'] = {
    failedPhoneNumbers: {},
    invalidPhoneNumbers: [],
    messagesSentByJourneyType: {},
    queuedMessages: 0,
    segmentsSent: 0,
    unsubscribedUsers: [],
  }

  it('should flag invalid phone numbers', async () => {
    const invalidPhoneNumbers = randomArray(() => fakerFields.phoneNumber())

    await persistEnqueueMessagesResults({
      ...mockedPayload,
      invalidPhoneNumbers,
    })

    expect(flagInvalidPhoneNumbers).toBeCalledWith(invalidPhoneNumbers)
  })

  it('Should opt out user if got unsubscribed user error', async () => {
    const unsubscribedUsers = randomArray(() => fakerFields.phoneNumber())

    await persistEnqueueMessagesResults({ ...mockedPayload, unsubscribedUsers })

    expect(optOutUser).toBeCalledTimes(unsubscribedUsers.length)
  })

  it('Should create user communication journey and user communication ', async () => {
    const messagesSentByJourneyType: (typeof mockedPayload)['messagesSentByJourneyType'] = {
      BULK_SMS: {
        [faker.string.alpha()]: randomArray(() => ({
          messageId: faker.string.uuid(),
          phoneNumber: fakerFields.phoneNumber(),
        })),
      },
      WELCOME_SMS: {
        [faker.string.alpha()]: randomArray(() => ({
          messageId: faker.string.uuid(),
          phoneNumber: fakerFields.phoneNumber(),
        })),
      },
    }

    await persistEnqueueMessagesResults({ ...mockedPayload, messagesSentByJourneyType })

    expect(bulkCreateCommunicationJourney).toBeCalledTimes(
      Object.keys(messagesSentByJourneyType).length,
    )
  })
})
