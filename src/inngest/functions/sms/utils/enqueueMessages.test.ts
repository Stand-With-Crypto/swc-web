import { faker } from '@faker-js/faker'
import { describe, expect, it } from '@jest/globals'

import {
  enqueueMessages,
  EnqueueMessagesPayload,
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

  const phoneNumbers = Array.from({ length: 10 }).map(() => fakerFields.phoneNumber())
  const mockedPayload: EnqueueMessagesPayload = {
    body: 'test message',
    journeyType: 'BULK_SMS',
  }

  it(`should call sendSMS with each phone number`, async () => {
    await enqueueMessages(phoneNumbers, mockedPayload)

    expect(sendSMS).toHaveBeenCalledTimes(phoneNumbers.length)
    phoneNumbers.forEach(phoneNumber => {
      expect(sendSMS).toHaveBeenCalledWith({ body: mockedPayload.body, to: phoneNumber })
    })
  })

  it(`should return the exact number of messages sent`, async () => {
    const count = await enqueueMessages(phoneNumbers, mockedPayload)

    expect(count).toBe(phoneNumbers.length)
  })

  it(`Should flag invalid phone numbers`, async () => {
    await enqueueMessages([...phoneNumbers, invalidPhoneNumber], mockedPayload)

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
        phoneNumbers[0],
      ),
    )
    const count = await enqueueMessages(phoneNumbers, mockedPayload)

    expect(sleep).toHaveBeenCalledTimes(1)
    expect(count).toBe(phoneNumbers.length)

    expect(sendSMS).toBeCalledTimes(phoneNumbers.length + 1)
  })
})
