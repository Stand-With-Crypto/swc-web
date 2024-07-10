import { NonRetriableError } from 'inngest'

import { messagingClient } from '@/utils/server/sms'
import { PHONE_NUMBER_REGEX } from '@/utils/shared/phoneNumber'

export async function validatePhoneNumber(phoneNumber: string) {
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

  const lookup = await messagingClient.lookups.v2.phoneNumbers(phoneNumber).fetch()

  if (!lookup.valid) {
    throw new NonRetriableError(`Invalid phone number: ${errorStr(lookup.validationErrors)}`)
  }
}

function errorStr(errors: string[]) {
  return errors
    .map(err => {
      return err.replaceAll('_', ' ').toLowerCase()
    })
    .join(', ')
}
