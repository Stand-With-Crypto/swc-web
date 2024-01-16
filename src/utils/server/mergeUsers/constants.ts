import { UserEmailAddressSource } from '@prisma/client'

export const MERGE_EMAIL_SOURCE_PRIORITY = [
  UserEmailAddressSource.COINBASE_AUTH,
  UserEmailAddressSource.THIRDWEB_EMBEDDED_AUTH,
  UserEmailAddressSource.USER_ENTERED,
]
