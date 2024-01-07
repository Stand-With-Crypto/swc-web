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
    cryptoAddress: ClientUserCryptoAddress | null
    primaryEmailAddress: { address: string } | null
  }
>

export const getSensitiveDataClientUser = (
  record: User & {
    userCryptoAddress: null | UserCryptoAddress
    primaryUserEmailAddress: UserEmailAddress | null
  },
): SensitiveDataClientUser => {
  const {
    fullName,
    userCryptoAddress,
    id,
    datetimeCreated,
    datetimeUpdated,
    isPubliclyVisible,
    primaryUserEmailAddress,
    phoneNumber,
  } = record

  return getClientModel({
    fullName,
    primaryEmailAddress: primaryUserEmailAddress
      ? {
          address: primaryUserEmailAddress.address,
        }
      : null,
    cryptoAddress: userCryptoAddress ? getClientUserCryptoAddress(userCryptoAddress) : null,
    id,
    datetimeCreated,
    datetimeUpdated,
    isPubliclyVisible,
    phoneNumber: phoneNumber ? formatPhoneNumber(phoneNumber) : '',
  })
}
