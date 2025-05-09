import { faker } from '@faker-js/faker'
import { CountryCode, parsePhoneNumber } from 'libphonenumber-js/core'
import phoneNumberMetadata from 'libphonenumber-js/mobile/metadata'

const COUNTRY_CODE_TO_PHONE_NUMBER_REGEX: Partial<Record<CountryCode, string>> = {
  US: '+1[0-9]{10}',
  CA: '+1[0-9]{10}',
  GB: '+44[0-9]{10}',
  AU: '+61[0-9]{10}',
}

// There is no way to generate a valid phone number programmatically, so this is a workaround to generate phone numbers that will pass the new validation
export const mockValidPhoneNumber = (countryCode: CountryCode = 'US') => {
  let validPhoneNumber = false
  let phoneNumber: string | undefined

  if (!COUNTRY_CODE_TO_PHONE_NUMBER_REGEX[countryCode]) {
    throw new Error(`Unsupported country code: ${countryCode}`)
  }

  let attempts = 0

  while (!validPhoneNumber) {
    phoneNumber = faker.helpers.fromRegExp(COUNTRY_CODE_TO_PHONE_NUMBER_REGEX[countryCode])

    if (validatePhoneNumber(phoneNumber, countryCode)) {
      validPhoneNumber = true
    }

    attempts += 1

    if (attempts > 500) {
      throw new Error(`Unable to generate valid phone number for country code: ${countryCode}`)
    }
  }

  if (!phoneNumber) throw new Error('Unable to generate valid phone number')

  return phoneNumber
}

function validatePhoneNumber(phoneNumber: string, countryCode: CountryCode) {
  if (!phoneNumber) return false

  try {
    const parsedPhoneNumber = parsePhoneNumber(phoneNumber, countryCode, phoneNumberMetadata)
    if (!parsedPhoneNumber) return false

    return (
      parsedPhoneNumber.isPossible() &&
      parsedPhoneNumber.isValid() &&
      parsedPhoneNumber.country === countryCode
    )
  } catch {
    return false
  }
}
