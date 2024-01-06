import { ClientAddress } from '@/clientModels/clientAddress'
import { SensitiveDataClientUser } from '@/clientModels/clientUser/sensitiveDataClientUser'

export const hasAllFormFieldsOnUserForUpdateUserProfileForm = (
  user: SensitiveDataClientUser & { address: ClientAddress | null },
) => {
  console.log('user', user)
  return Boolean(user.fullName && user.primaryEmailAddress && user.phoneNumber && user.address)
}
