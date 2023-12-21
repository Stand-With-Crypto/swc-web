import { getClientAddress } from '@/clientModels/clientAddress'
import { getSensitiveDataClientCryptoAddressUser } from '@/clientModels/clientCryptoAddress/sensitiveDataClientCryptoAddressUser'
import { getSensitiveDataClientUserAction } from '@/clientModels/clientUserAction/sensitiveDataClientUserAction'
import { queryDTSIPeopleBySlugForUserActions } from '@/data/dtsi/queries/queryDTSIPeopleBySlugForUserActions'
import { appRouterGetAuthUser } from '@/utils/server/appRouterGetAuthUser'
import { prismaClient } from '@/utils/server/prismaClient'
import 'server-only'

export async function getAuthenticatedData() {
  const authUser = await appRouterGetAuthUser()
  if (!authUser) {
    return null
  }
  const cryptoAddressUser = await prismaClient.cryptoAddressUser.findUniqueOrThrow({
    where: {
      cryptoAddress: authUser.address,
    },
    include: {
      address: true,
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
  cryptoAddressUser.userActions.forEach(userAction => {
    if (userAction.userActionCall) {
      dtsiSlugs.add(userAction.userActionCall.recipientDtsiSlug)
    } else if (userAction.userActionEmail) {
      userAction.userActionEmail.userActionEmailRecipients.forEach(userActionEmailRecipient => {
        dtsiSlugs.add(userActionEmailRecipient.dtsiSlug)
      })
    }
  })
  const dtsiPeople = await queryDTSIPeopleBySlugForUserActions(Array.from(dtsiSlugs)).then(
    x => x.people,
  )
  const { userActions, address, ...rest } = cryptoAddressUser
  return {
    ...getSensitiveDataClientCryptoAddressUser(rest),
    address: address && getClientAddress(address),
    userActions: userActions.map(record =>
      getSensitiveDataClientUserAction({ record, dtsiPeople }),
    ),
  }
}
