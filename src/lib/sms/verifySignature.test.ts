import { faker } from '@faker-js/faker'
import { expect, it } from '@jest/globals'
import twilio from 'twilio'

import { requiredEnv } from '@/utils/shared/requiredEnv'

import { verifySignature } from './verifySignature'

import { parseTwilioBody } from '@/lib/sms'

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
        get: jest.fn().mockImplementation(() => expectedSignature),
      },
      text: jest.fn().mockImplementation(() => Promise.resolve(params)),
      url,
    }))

    const response = await verifySignature(mockedRequest())

    expect(response).toBe(true)
  })

  it('should return false if signature is invalid', async () => {
    const expectedSignature = twilio.getExpectedTwilioSignature(
      authToken,
      url,
      parseTwilioBody(params),
    )

    const mockedRequest = jest.fn().mockImplementation(() => ({
      headers: {
        get: jest.fn().mockImplementation(() => expectedSignature + '1'),
      },
      text: jest.fn().mockImplementation(() => Promise.resolve(params)),
      url,
    }))

    const response = await verifySignature(mockedRequest())

    expect(response).toBe(false)
  })
})
