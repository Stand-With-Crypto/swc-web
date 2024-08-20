import parsePhoneNumber, { CountryCode } from 'libphonenumber-js'

const supportedCountries: CountryCode[] = ['US', 'CA']

export const isPhoneNumberSupported = async (phoneNumber: string) => {
  const parsedPhoneNumber = parsePhoneNumber(phoneNumber)

  if (!parsedPhoneNumber?.country) {
    return false
  }

  return supportedCountries.includes(parsedPhoneNumber.country)
}
