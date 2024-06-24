import { faker } from '@faker-js/faker'
import { expect, it } from '@jest/globals'
import twilio from 'twilio'

import { requiredEnv } from '@/utils/shared/requiredEnv'

import { parseTwilioBody, verifySignature } from './verifySignature'

const authToken = requiredEnv(process.env.TWILIO_AUTH_TOKEN, 'TWILIO_AUTH_TOKEN')

describe('verifySignature', () => {
  const url = faker.internet.url({ protocol: 'https' })
  const params = `ToCountry=${faker.location.countryCode()}&FromCountry=${faker.location.countryCode()}&To=${faker.phone.number()}&ToZip=&NumSegments=${faker.number.int()}&MessageSid=${faker.seed()}&From=${faker.phone.number()}&ApiVersion=${faker.date.anytime().toString()}`

  it('should return true if signature is valid', async () => {
    const expectedSignature = twilio.getExpectedTwilioSignature(
      authToken,
      url,
      parseTwilioBody(params),
    )

    const mockedRequest = jest.fn().mockImplementation(() => ({
      headers: {
        get: jest
          .fn()
          .mockImplementation(key => (key === 'X-Twilio-Signature' ? expectedSignature : '')),
      },
      text: jest.fn().mockImplementation(() => Promise.resolve(params)),
      url,
    }))

    const [isVerified] = await verifySignature(mockedRequest())

    expect(isVerified).toBe(true)
  })

  it('should return false if signature is invalid', async () => {
    const expectedSignature = twilio.getExpectedTwilioSignature(
      authToken,
      url,
      parseTwilioBody(params),
    )

    const mockedRequest = jest.fn().mockImplementation(() => ({
      headers: {
        get: jest
          .fn()
          .mockImplementation(key => (key === 'X-Twilio-Signature' ? expectedSignature + '1' : '')),
      },
      text: jest.fn().mockImplementation(() => Promise.resolve(params)),
      url,
    }))

    const [isVerified] = await verifySignature(mockedRequest())

    expect(isVerified).toBe(false)
  })
})
