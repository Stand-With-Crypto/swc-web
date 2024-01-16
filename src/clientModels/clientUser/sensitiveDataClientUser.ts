import {
  ClientUserCryptoAddress,
  getClientUserCryptoAddress,
} from '@/clientModels/clientUser/clientUserCryptoAddress'
import { ClientModel, getClientModel } from '@/clientModels/utils'
import { formatPhoneNumber } from '@/utils/shared/phoneNumber'
import { User, UserCryptoAddress, UserEmailAddress } from '@prisma/client'

export type SensitiveDataClientUser = ClientModel<
  Pick<
    User,
    'id' | 'datetimeCreated' | 'datetimeUpdated' | 'isPubliclyVisible' | 'fullName' | 'phoneNumber'
  > & {
    primaryUserCryptoAddress: ClientUserCryptoAddress | null
    primaryUserEmailAddress: { address: string } | null
  }
>

export const getSensitiveDataClientUser = (
  record: User & {
    primaryUserCryptoAddress: null | UserCryptoAddress
    primaryUserEmailAddress: UserEmailAddress | null
  },
): SensitiveDataClientUser => {
  const {
    fullName,
    primaryUserCryptoAddress,
    id,
    datetimeCreated,
    datetimeUpdated,
    isPubliclyVisible,
    primaryUserEmailAddress,
    phoneNumber,
  } = record

  return getClientModel({
    fullName,
    primaryUserEmailAddress: primaryUserEmailAddress
      ? {
          address: primaryUserEmailAddress.emailAddress,
        }
      : null,
    primaryUserCryptoAddress: primaryUserCryptoAddress
      ? getClientUserCryptoAddress(primaryUserCryptoAddress)
      : null,
    id,
    datetimeCreated,
    datetimeUpdated,
    isPubliclyVisible,
    phoneNumber: phoneNumber ? formatPhoneNumber(phoneNumber) : '',
  })
}
