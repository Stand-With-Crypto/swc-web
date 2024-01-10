import { getClientAddress } from '@/clientModels/clientAddress'
import { getSensitiveDataClientUserWithENSData } from '@/clientModels/clientUser/sensitiveDataClientUser'
import { getSensitiveDataClientUserAction } from '@/clientModels/clientUserAction/sensitiveDataClientUserAction'
import { queryDTSIPeopleBySlugForUserActions } from '@/data/dtsi/queries/queryDTSIPeopleBySlugForUserActions'
import { getENSDataFromCryptoAddressAndFailGracefully } from '@/data/web3/getENSDataFromCryptoAddress'
import { appRouterGetAuthUser } from '@/utils/server/appRouterGetAuthUser'
import { prismaClient } from '@/utils/server/prismaClient'
import 'server-only'

export async function getAuthenticatedData() {
  const authUser = await appRouterGetAuthUser()
  if (!authUser) {
    return null
  }
  const user = await prismaClient.user.findFirstOrThrow({
    where: {
      userCryptoAddress: { address: authUser.address },
    },
    include: {
      userCryptoAddress: true,
      address: true,
      primaryUserEmailAddress: true,
      userActions: {
        include: {
          userActionDonation: true,
          userActionEmail: {
            include: {
              address: true,
              userActionEmailRecipients: true,
            },
          },
          userActionCall: true,
          nftMint: { include: { nft: true } },
          userActionOptIn: true,
        },
      },
    },
  })
  const dtsiSlugs = new Set<string>()
  user.userActions.forEach(userAction => {
    if (userAction.userActionCall) {
      dtsiSlugs.add(userAction.userActionCall.recipientDtsiSlug)
    } else if (userAction.userActionEmail) {
      userAction.userActionEmail.userActionEmailRecipients.forEach(userActionEmailRecipient => {
        dtsiSlugs.add(userActionEmailRecipient.dtsiSlug)
      })
    }
  })
  const [dtsiPeople, ensData] = await Promise.all([
    queryDTSIPeopleBySlugForUserActions(Array.from(dtsiSlugs)).then(x => x.people),
    getENSDataFromCryptoAddressAndFailGracefully(user.userCryptoAddress!.address),
  ])
  const { userActions, address, ...rest } = user
  return {
    ...getSensitiveDataClientUserWithENSData(rest, ensData),
    address: address && getClientAddress(address),
    userActions: userActions.map(record =>
      getSensitiveDataClientUserAction({ record, dtsiPeople }),
    ),
  }
}
