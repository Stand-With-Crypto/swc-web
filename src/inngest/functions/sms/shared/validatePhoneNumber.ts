import { NonRetriableError } from 'inngest'

import { PHONE_NUMBER_REGEX } from '@/utils/shared/phoneNumber'

export function validatePhoneNumber(phoneNumber: string) {
  if (!phoneNumber) {
    throw new NonRetriableError('Missing phone number')
  }

  if (!PHONE_NUMBER_REGEX.test(phoneNumber)) {
    throw new NonRetriableError('Invalid phone number')
  }
}
