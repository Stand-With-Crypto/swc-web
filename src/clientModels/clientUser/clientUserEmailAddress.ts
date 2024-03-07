import { UserEmailAddress } from '@prisma/client'

import { ClientModel, getClientModel } from '@/clientModels/utils'

export type SensitiveClientUserEmailAddress = ClientModel<
  Pick<UserEmailAddress, 'emailAddress' | 'isVerified'>
>

export function getSensitiveClientUserEmailAddress(
  userEmailAddress: UserEmailAddress,
): SensitiveClientUserEmailAddress {
  return getClientModel({
    emailAddress: userEmailAddress.emailAddress,
    isVerified: userEmailAddress.isVerified,
  })
}
