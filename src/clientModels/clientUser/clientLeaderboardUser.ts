import { User, UserCryptoAddress, UserInformationVisibility } from '@prisma/client'

import { ClientUser } from '@/clientModels/clientUser/clientUser'
import {
  ClientUserCryptoAddressWithENSData,
  getClientUserCryptoAddressWithENSData,
} from '@/clientModels/clientUser/clientUserCryptoAddress'
import { ClientModel, getClientModel } from '@/clientModels/utils'
import { UserENSData } from '@/data/web3/types'

export type ClientLeaderboardUser = ClientModel<
  Pick<User, 'id' | 'informationVisibility'> &
    Pick<ClientUser, 'manuallySetInformation'> & {
      firstName: string | null
      lastName: string | null
      primaryUserCryptoAddress: ClientUserCryptoAddressWithENSData | null
    }
>

export type GetClientProps = User & {
  primaryUserCryptoAddress: null | UserCryptoAddress
} & Pick<ClientUser, 'manuallySetInformation'>

export const getClientLeaderboardUser = (
  record: GetClientProps,
  ensData: UserENSData | null | undefined,
): ClientLeaderboardUser => {
  const { firstName, lastName, primaryUserCryptoAddress, id, manuallySetInformation } = record
  const informationVisibility =
    record.informationVisibility === UserInformationVisibility.ANONYMOUS
      ? UserInformationVisibility.CRYPTO_INFO_ONLY
      : record.informationVisibility

  return getClientModel({
    manuallySetInformation,
    firstName: informationVisibility === UserInformationVisibility.ALL_INFO ? firstName : null,
    lastName: informationVisibility === UserInformationVisibility.ALL_INFO ? lastName : null,
    // return ENS related information regardless of informationVisibility because it's public crypto info
    primaryUserCryptoAddress: primaryUserCryptoAddress
      ? getClientUserCryptoAddressWithENSData(primaryUserCryptoAddress, ensData)
      : null,
    id,
    informationVisibility,
  })
}
