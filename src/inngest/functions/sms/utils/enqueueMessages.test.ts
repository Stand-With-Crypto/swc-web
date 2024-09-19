import { faker } from '@faker-js/faker'
import { describe, expect, it } from '@jest/globals'

import {
  countMessagesAndSegments,
  EnqueueMessagePayload,
  enqueueMessages,
  PayloadMessage,
} from '@/inngest/functions/sms/utils/enqueueMessages'
import { flagInvalidPhoneNumbers } from '@/inngest/functions/sms/utils/flagInvalidPhoneNumbers'
import { getSMSVariablesByPhoneNumbers } from '@/inngest/functions/sms/utils/getSMSVariablesByPhoneNumbers'
import { fakerFields } from '@/mocks/fakerUtils'
import { mockUser } from '@/mocks/models/mockUser'
import { sendSMS, SendSMSError } from '@/utils/server/sms'
import { optOutUser } from '@/utils/server/sms/actions'
import type { SendSMSPayload } from '@/utils/server/sms/sendSMS'
import {
  INVALID_PHONE_NUMBER_CODE,
  IS_UNSUBSCRIBED_USER_CODE,
  TOO_MANY_REQUESTS_CODE,
} from '@/utils/server/sms/SendSMSError'
import { UserSMSVariables } from '@/utils/server/sms/utils/variables'
import { sleep } from '@/utils/shared/sleep'
import { fullUrl } from '@/utils/shared/urls'

const invalidPhoneNumber = fakerFields.phoneNumber()
const optedOutUserPhoneNumber = fakerFields.phoneNumber()

jest.mock('@/utils/shared/sleep', () => ({
  sleep: jest.fn().mockImplementation(() => Promise.resolve()),
}))

jest.mock('@/inngest/functions/sms/utils/communicationJourney', () => ({
  createCommunication: jest.fn(),
  createCommunicationJourneys: jest.fn(),
  bulkCreateCommunicationJourney: jest.fn(),
}))

jest.mock('@/inngest/functions/sms/utils/flagInvalidPhoneNumbers', () => ({
  flagInvalidPhoneNumbers: jest.fn(),
}))

jest.mock('@/inngest/functions/sms/utils/getSMSVariablesByPhoneNumbers', () => ({
  getSMSVariablesByPhoneNumbers: jest.fn().mockImplementation(() => Promise.resolve({})),
}))

jest.mock('@/utils/server/sms/utils', () => ({
  getUserByPhoneNumber: jest.fn(),
  countSegments: jest.fn().mockImplementation(() => 1),
}))

jest.mock('@/utils/server/sms/actions', () => ({
  optOutUser: jest.fn(),
}))

jest.mock('@/utils/server/sms', () => ({
  ...jest.requireActual('@/utils/server/sms'),
  sendSMS: jest.fn().mockImplementation(({ to }: SendSMSPayload) => {
    if (to === invalidPhoneNumber) {
      return Promise.reject(
        new SendSMSError(
          {
            code: INVALID_PHONE_NUMBER_CODE,
          },
          to,
        ),
      )
    } else if (to === optedOutUserPhoneNumber) {
      return Promise.reject(
        new SendSMSError(
          {
            code: IS_UNSUBSCRIBED_USER_CODE,
          },
          to,
        ),
      )
    }

    return Promise.resolve({
      sid: faker.string.uuid(),
    })
  }),
}))

describe('enqueueMessages function', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  const getFakeMessage = (): PayloadMessage => ({
    body: faker.string.alpha(10),
    journeyType: 'BULK_SMS',
  })

  const mockedPayload: EnqueueMessagePayload[] = [
    {
      phoneNumber: fakerFields.phoneNumber(),
      messages: [getFakeMessage(), getFakeMessage()],
    },
    {
      phoneNumber: fakerFields.phoneNumber(),
      messages: [getFakeMessage()],
    },
    {
      phoneNumber: fakerFields.phoneNumber(),
      messages: [],
    },
  ]

  const { segments: expectedSegments, messages: expectedMessages } =
    countMessagesAndSegments(mockedPayload)

  it(`should call sendSMS with each phone number`, async () => {
    await enqueueMessages(mockedPayload)

    expect(sendSMS).toHaveBeenCalledTimes(mockedPayload.length)
    mockedPayload.forEach(({ messages, phoneNumber }) => {
      messages.forEach(({ body }) => {
        expect(sendSMS).toHaveBeenCalledWith({ body, to: phoneNumber })
      })
    })
  })

  it(`should return the exact number of messages sent`, async () => {
    const { messages, segments } = await enqueueMessages(mockedPayload)

    expect(segments).toBe(expectedSegments)
    expect(messages).toBe(expectedMessages)
  })

  it(`Should flag invalid phone numbers`, async () => {
    await enqueueMessages([
      ...mockedPayload,
      {
        phoneNumber: invalidPhoneNumber,
        messages: [getFakeMessage()],
      },
    ])

    expect(flagInvalidPhoneNumbers).toBeCalledTimes(1)
    expect(flagInvalidPhoneNumbers).toBeCalledWith([invalidPhoneNumber])
  })

  it(`Should retry if got too many requests error`, async () => {
    // eslint-disable-next-line no-extra-semi
    ;(sendSMS as jest.Mock).mockRejectedValueOnce(
      new SendSMSError(
        {
          code: TOO_MANY_REQUESTS_CODE,
        },
        mockedPayload[0].phoneNumber,
      ),
    )
    const { segments } = await enqueueMessages(mockedPayload)

    expect(sleep).toHaveBeenCalledTimes(1)
    expect(segments).toBe(expectedSegments)

    expect(sendSMS).toBeCalledTimes(expectedMessages + 1)
  })

  it('Should opt out user if got unsubscribed user error', async () => {
    await enqueueMessages([
      ...mockedPayload,
      {
        phoneNumber: optedOutUserPhoneNumber,
        messages: [getFakeMessage()],
      },
    ])

    expect(optOutUser).toBeCalledTimes(1)
    expect(optOutUser).toBeCalledWith(optedOutUserPhoneNumber, undefined)
  })

  const mockedUser = { ...mockUser(), phoneNumber: fakerFields.phoneNumber() }
  const mockedSessionId = faker.string.uuid()

  it.each([
    [
      `Please, finish your profile at ${fullUrl(`/profile?sessionId={{ sessionId }}`)}`,
      `Please, finish your profile at ${fullUrl(`/profile?sessionId=${mockedSessionId}`)}`,
    ],
    [
      `{{ firstName }} {{ lastName }}, thanks for subscribing to Stand With Crypto`,
      `${mockedUser.firstName} ${mockedUser.lastName}, thanks for subscribing to Stand With Crypto`,
    ],
    [`You received a NFT: {{ invalidVariable }}`, `You received a NFT: `],
    ['Message with no variables', 'Message with no variables'],
  ])('should correctly parse the sms body with custom variables', async (input, output) => {
    // eslint-disable-next-line no-extra-semi
    ;(getSMSVariablesByPhoneNumbers as jest.Mock).mockImplementation(() =>
      Promise.resolve<Record<string, UserSMSVariables>>({
        [mockedUser.phoneNumber]: {
          firstName: mockedUser.firstName,
          lastName: mockedUser.lastName,
          sessionId: mockedSessionId,
          userId: mockedUser.id,
        },
      }),
    )

    await enqueueMessages([
      {
        messages: [{ body: input, journeyType: 'BULK_SMS' }],
        phoneNumber: mockedUser.phoneNumber,
      },
    ])

    expect(sendSMS).toHaveBeenCalledWith({ body: output, to: mockedUser.phoneNumber })
  })
})
