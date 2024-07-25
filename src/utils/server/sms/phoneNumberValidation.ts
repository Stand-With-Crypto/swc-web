import { messagingClient } from '@/utils/server/sms/client'

export const twilioPhoneNumberValidation = async (phoneNumber: string) => {
  const lookup = await messagingClient.lookups.v2.phoneNumbers(phoneNumber).fetch()

  return lookup.valid
}
