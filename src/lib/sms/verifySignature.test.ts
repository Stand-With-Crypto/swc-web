import { faker } from '@faker-js/faker'
import { expect, it } from '@jest/globals'
import twilio from 'twilio'

import { requiredEnv } from '@/utils/shared/requiredEnv'

import { verifySignature } from './verifySignature'

const authToken = requiredEnv(process.env.TWILIO_AUTH_TOKEN, 'TWILIO_AUTH_TOKEN')

describe('verifySignature', () => {
  const params = {
    FromCountry: faker.location.countryCode(),
    To: faker.phone.number(),
    NumSegments: faker.number.int().toString(),
    From: faker.phone.number(),
  }
  const webhookUrl = faker.internet.url()
  const url = `${webhookUrl}?${new URLSearchParams(params).toString()}`

  it('should return true if signature is valid', async () => {
    const expectedSignature = twilio.getExpectedTwilioSignature(authToken, url, params)

    const mockedRequest = jest.fn().mockImplementation(() => ({
      headers: {
        get: jest.fn().mockImplementation(() => expectedSignature),
      },
      url,
    }))

    const response = await verifySignature(mockedRequest())

    expect(response).toBe(true)
  })

  it('should return false if signature is invalid', async () => {
    const expectedSignature = twilio.getExpectedTwilioSignature(authToken, url, params)

    const mockedRequest = jest.fn().mockImplementation(() => ({
      headers: {
        get: jest.fn().mockImplementation(() => expectedSignature + '1'),
      },
      url,
    }))

    const response = await verifySignature(mockedRequest())

    expect(response).toBe(false)
  })
})
