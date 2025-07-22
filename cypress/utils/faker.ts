import { faker } from '@faker-js/faker'
import dtsiSlugs from 'cypress/fixture/testingDtsiSlugs.json'
import { parsePhoneNumber } from 'libphonenumber-js/core'
import phoneNumberMetadata from 'libphonenumber-js/mobile/metadata'

export enum SupportedFiatCurrencyCodes {
  USD = 'USD',
}

export enum SupportedCryptoCurrencyCodes {
  ETH = 'ETH',
}

// There is no way to generate a valid phone number programmatically, so this is a workaround to generate phone numbers that will pass the new validation
export const mockValidPhoneNumber = () => {
  let validPhoneNumber = false
  let phoneNumber: string | undefined
  while (!validPhoneNumber) {
    phoneNumber = faker.helpers.fromRegExp('+1[0-9]{10}')

    if (validatePhoneNumber(phoneNumber)) {
      validPhoneNumber = true
    }
  }

  if (!phoneNumber) throw new Error('Unable to generate valid phone number')

  return phoneNumber
}

function validatePhoneNumber(phoneNumber: string) {
  if (!phoneNumber) return false

  try {
    const parsedPhoneNumber = parsePhoneNumber(phoneNumber, 'US', phoneNumberMetadata)
    if (!parsedPhoneNumber) return false

    return parsedPhoneNumber.isPossible() && parsedPhoneNumber.isValid()
  } catch {
    return false
  }
}

export const fakerFields = {
  id: () => faker.string.uuid(),
  dtsiStanceScore: () => faker.number.int({ min: 0, max: 100 }),
  dtsiSlug: () => faker.helpers.arrayElement(dtsiSlugs),
  supportedFiatCurrencyCode: () =>
    faker.helpers.arrayElement(Object.values(SupportedFiatCurrencyCodes)),
  supportedCryptoCurrencyCode: () =>
    faker.helpers.arrayElement(Object.values(SupportedCryptoCurrencyCodes)),
  phoneNumber: mockValidPhoneNumber,
  stateCode: (options?: { abbreviated?: boolean }) => faker.location.state(options),
  electoralZone: () => faker.number.int({ min: 1, max: 20 }).toString(),
  generateReferralId: () => faker.string.uuid().slice(0, 12),
}
