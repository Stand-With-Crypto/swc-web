import { faker } from '@faker-js/faker'
import { describe, expect, it } from '@jest/globals'

import {
  countMessagesAndSegments,
  EnqueueMessagePayload,
  enqueueMessages,
  PayloadMessage,
} from '@/inngest/functions/sms/utils/enqueueMessages'
import { flagInvalidPhoneNumbers } from '@/inngest/functions/sms/utils/flagInvalidPhoneNumbers'
import { fakerFields } from '@/mocks/fakerUtils'
import { sendSMS, SendSMSError } from '@/utils/server/sms'
import type { SendSMSPayload } from '@/utils/server/sms/sendSMS'
import { INVALID_PHONE_NUMBER_CODE, TOO_MANY_REQUESTS_CODE } from '@/utils/server/sms/SendSMSError'
import { sleep } from '@/utils/shared/sleep'

jest.mock('@/utils/shared/sleep', () => ({
  sleep: jest.fn().mockImplementation(() => Promise.resolve()),
}))

jest.mock('@/inngest/functions/sms/utils/communicationJourney', () => ({
  createCommunication: jest.fn(),
  createCommunicationJourneys: jest.fn(),
}))

jest.mock('@/inngest/functions/sms/utils/flagInvalidPhoneNumbers', () => ({
  flagInvalidPhoneNumbers: jest.fn(),
}))

const invalidPhoneNumber = fakerFields.phoneNumber()

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
})
