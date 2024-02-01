import { ClientAddress } from '@/clientModels/clientAddress'
import { SensitiveDataClientUser } from '@/clientModels/clientUser/sensitiveDataClientUser'

export const hasCompleteUserProfile = (
  user: SensitiveDataClientUser & { address: ClientAddress | null },
) => {
  return Boolean(
    user.firstName &&
      user.lastName &&
      user.primaryUserEmailAddress &&
      user.phoneNumber &&
      user.address,
  )
}
