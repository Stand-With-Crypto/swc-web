import { faker } from '@faker-js/faker'
import { describe, expect, it } from '@jest/globals'

import { validatePhoneNumbers } from '@/inngest/functions/sms/utils/validatePhoneNumbers'
import { sleep } from '@/utils/shared/sleep'

jest.mock('@/utils/shared/sleep', () => ({
  sleep: jest.fn().mockImplementation(() => Promise.resolve()),
}))

describe('validatePhoneNumbers function', () => {
  const generatePhoneNumbers = (length: number) =>
    Array.from({ length }).map(() => faker.phone.number())

  const mockedPhoneNumbers = {
    valid: generatePhoneNumbers(5),
    invalid: generatePhoneNumbers(5),
  }

  const validatePhoneNumber = jest.fn().mockImplementation(phoneNumber => {
    if (mockedPhoneNumbers.valid.includes(phoneNumber)) {
      return Promise.resolve(true)
    } else if (mockedPhoneNumbers.invalid.includes(phoneNumber)) {
      return Promise.resolve(false)
    } else {
      return Promise.reject(new Error('Validation error'))
    }
  })

  it('should call validate function for each number', async () => {
    const phoneNumbers = [...mockedPhoneNumbers.invalid, ...mockedPhoneNumbers.valid]
    await validatePhoneNumbers(phoneNumbers, validatePhoneNumber)

    expect(validatePhoneNumber).toHaveBeenCalledTimes(phoneNumbers.length)
    phoneNumbers.forEach(phoneNumber => {
      expect(validatePhoneNumber).toHaveBeenCalledWith(phoneNumber)
    })
  })

  it('should add the number to the right category', async () => {
    const unidentifiedPhoneNumbers = generatePhoneNumbers(5)
    const phoneNumbers = [
      ...mockedPhoneNumbers.invalid,
      ...mockedPhoneNumbers.valid,
      ...unidentifiedPhoneNumbers,
    ]
    const result = await validatePhoneNumbers(phoneNumbers, validatePhoneNumber)

    expect(result).toBeDefined()
    mockedPhoneNumbers.valid.forEach(phoneNumber => {
      expect(result.valid).toContain(phoneNumber)
    })
    mockedPhoneNumbers.invalid.forEach(phoneNumber => {
      expect(result.invalid).toContain(phoneNumber)
    })
    unidentifiedPhoneNumbers.forEach(phoneNumber => {
      expect(result.unidentified).toContain(phoneNumber)
    })
  })

  it('should retry if validate function throws an error', async () => {
    const unidentifiedPhoneNumbers = generatePhoneNumbers(5)
    const retries = 5

    const result = await validatePhoneNumbers(
      unidentifiedPhoneNumbers,
      validatePhoneNumber,
      retries,
    )

    expect(sleep).toHaveBeenCalledTimes(retries)
    expect(result).toBeDefined()
    unidentifiedPhoneNumbers.forEach(phoneNumber => {
      expect(result.unidentified).toContain(phoneNumber)
    })
  })
})
