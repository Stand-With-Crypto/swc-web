import { NonRetriableError } from 'inngest'

import { PHONE_NUMBER_REGEX } from '@/utils/shared/phoneNumber'

export function validatePhoneNumber(phoneNumber: string) {
  if (!phoneNumber) {
    throw new NonRetriableError('Missing phone number')
  }

  if (!PHONE_NUMBER_REGEX.test(phoneNumber)) {
    throw new NonRetriableError('Invalid phone number')
  }

  // only send SMS to US and CA numbers
  if (!phoneNumber.startsWith('+1')) {
    throw new NonRetriableError('Phone number not from US or CA')
  }
}
