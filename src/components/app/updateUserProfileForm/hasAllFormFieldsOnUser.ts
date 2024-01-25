import { ClientAddress } from '@/clientModels/clientAddress'
import { SensitiveDataClientUser } from '@/clientModels/clientUser/sensitiveDataClientUser'

export function hasAllFormFieldsOnUserForUpdateUserProfileForm(
  user: SensitiveDataClientUser & { address: ClientAddress | null },
) {
  return Boolean(
    user.firstName &&
      user.lastName &&
      user.primaryUserEmailAddress &&
      user.phoneNumber &&
      user.address,
  )
}
