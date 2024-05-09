import { User } from '@prisma/client'

export const hasCompleteUserProfileServer = (user: User) => {
  return Boolean(
    user.firstName &&
      user.lastName &&
      user.primaryUserEmailAddressId &&
      user.phoneNumber &&
      user.addressId,
  )
}
