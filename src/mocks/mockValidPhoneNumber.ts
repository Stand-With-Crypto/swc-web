import { faker } from '@faker-js/faker'

import { validatePhoneNumber } from '@/utils/shared/phoneNumber'

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
