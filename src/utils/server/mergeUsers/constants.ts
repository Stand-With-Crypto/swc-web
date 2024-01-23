import { UserEmailAddressSource } from '@prisma/client'

export const MERGE_EMAIL_SOURCE_PRIORITY = [
  UserEmailAddressSource.VERIFIED_THIRD_PARTY,
  UserEmailAddressSource.THIRDWEB_EMBEDDED_AUTH,
  UserEmailAddressSource.USER_ENTERED,
]
