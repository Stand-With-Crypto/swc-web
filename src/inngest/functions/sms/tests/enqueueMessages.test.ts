import { faker } from '@faker-js/faker'
import { describe, expect, it } from '@jest/globals'
import { update } from 'lodash-es'

import {
  EnqueueMessagePayload,
  enqueueMessages,
  persistEnqueueMessagesResults,
} from '@/inngest/functions/sms/enqueueMessages'
import { countMessagesAndSegments } from '@/inngest/functions/sms/utils/countMessagesAndSegments'
import { flagInvalidPhoneNumbers } from '@/inngest/functions/sms/utils/flagInvalidPhoneNumbers'
import { fakerFields } from '@/mocks/fakerUtils'
import { sendSMS, SendSMSError } from '@/utils/server/sms'
import { optOutUser } from '@/utils/server/sms/actions'
import * as smsErrorCodes from '@/utils/server/sms/errorCodes'
import type { SendSMSPayload } from '@/utils/server/sms/sendSMS'
import { UserSMSVariables } from '@/utils/server/sms/utils/variables'
import { DEFAULT_SUPPORTED_COUNTRY_CODE } from '@/utils/shared/supportedCountries'
import { apiUrls, fullUrl } from '@/utils/shared/urls'

jest.mock('@/inngest/functions/sms/utils/flagInvalidPhoneNumbers', () => ({
  flagInvalidPhoneNumbers: jest.fn(),
}))

jest.mock('@/inngest/functions/sms/utils/getSMSVariablesByPhoneNumbers', () => ({
  getSMSVariablesByPhoneNumbers: jest.fn().mockImplementation(() => Promise.resolve({})),
}))

jest.mock('@/utils/server/sms/utils', () => ({
  ...jest.requireActual('@/utils/server/sms/utils/countSegments'),
  ...jest.requireActual('@/utils/server/sms/utils/getCountryCodeFromPhoneNumber'),
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
    firstName: faker.helpers.maybe(faker.person.firstName),
    lastName: faker.helpers.maybe(faker.person.lastName),
    sessionId: faker.helpers.maybe(faker.string.uuid),
    userId: faker.helpers.maybe(faker.string.uuid),
  })

  const mockedPayloadVariables: Record<string, UserSMSVariables> = mockedPayload.reduce(
    (acc, curr) => update(acc, [curr.phoneNumber], mockSMSVariables),
    {},
  )

  it('should call sendSMS with each phone number', async () => {
    await enqueueMessages(mockedPayload, mockedPayloadVariables, DEFAULT_SUPPORTED_COUNTRY_CODE)

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
      DEFAULT_SUPPORTED_COUNTRY_CODE,
    )

    expect(queuedMessages).toBe(messages)
    expect(segmentsSent).toBe(segments)
  })

  it('should handle sendSMS error scenarios', async () => {
    const invalidPhoneNumber = mockedPayload[0].phoneNumber
    const unsubscribedPhoneNumber = mockedPayload[1].phoneNumber
    const failedPhoneNumber = mockedPayload[2].phoneNumber

    const phoneNumbersThatShouldThrowErrors = {
      [invalidPhoneNumber]: smsErrorCodes.INVALID_PHONE_NUMBER_CODE,
      [unsubscribedPhoneNumber]: smsErrorCodes.IS_UNSUBSCRIBED_USER_CODE,
      [failedPhoneNumber]: smsErrorCodes.TOO_MANY_REQUESTS_CODE,
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
      DEFAULT_SUPPORTED_COUNTRY_CODE,
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
      DEFAULT_SUPPORTED_COUNTRY_CODE,
    )

    expect(sendSMS).toBeCalledWith({
      body: output,
      to: phoneNumber,
      statusCallbackUrl: fullUrl(
        apiUrls.smsStatusCallback({
          journeyType,
          campaignName,
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
})
