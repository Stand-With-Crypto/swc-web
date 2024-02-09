import { getClientAddress } from '@/clientModels/clientAddress'
import { getClientUser } from '@/clientModels/clientUser/clientUser'
import { getClientUserCryptoAddress } from '@/clientModels/clientUser/clientUserCryptoAddress'
import { getSensitiveDataClientUserWithENSData } from '@/clientModels/clientUser/sensitiveDataClientUser'
import { getSensitiveDataClientUserAction } from '@/clientModels/clientUserAction/sensitiveDataClientUserAction'
import { queryDTSIPeopleBySlugForUserActions } from '@/data/dtsi/queries/queryDTSIPeopleBySlugForUserActions'
import { getENSDataFromCryptoAddressAndFailGracefully } from '@/data/web3/getENSDataFromCryptoAddress'
import { prismaClient } from '@/utils/server/prismaClient'
import { appRouterGetAuthUser } from '@/utils/server/thirdweb/appRouterGetAuthUser'
import { UserInformationVisibility } from '@prisma/client'
import 'server-only'

export async function getAuthenticatedData() {
  const authUser = await appRouterGetAuthUser()
  if (!authUser) {
    return null
  }
  const user = await prismaClient.user.findFirstOrThrow({
    include: {
      address: true,
      primaryUserCryptoAddress: true,
      primaryUserEmailAddress: true,
      userActions: {
        include: {
          nftMint: true,
          userActionCall: true,
          userActionDonation: true,
          userActionEmail: {
            include: {
              address: true,
              userActionEmailRecipients: true,
            },
          },
          userActionOptIn: true,
        },
      },
      userCryptoAddresses: true,
      userMergeAlertUserA: { include: { userB: { include: { primaryUserCryptoAddress: true } } } },
      userMergeAlertUserB: { include: { userA: { include: { primaryUserCryptoAddress: true } } } },
    },
    where: {
      id: authUser.userId,
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
    getENSDataFromCryptoAddressAndFailGracefully(user.primaryUserCryptoAddress!.cryptoAddress),
  ])
  const { userActions, address, ...rest } = user
  const currentlyAuthenticatedUserCryptoAddress = user.userCryptoAddresses.find(
    x => x.cryptoAddress === authUser.address,
  )
  if (!currentlyAuthenticatedUserCryptoAddress) {
    throw new Error('Primary user crypto address not found')
  }
  return {
    ...getSensitiveDataClientUserWithENSData(rest, ensData),

    address: address && getClientAddress(address),

    // LATER-TASK show UX if this address is not the primary address
    currentlyAuthenticatedUserCryptoAddress: getClientUserCryptoAddress(
      currentlyAuthenticatedUserCryptoAddress,
    ),
    mergeAlerts: [
      ...user.userMergeAlertUserA.map(
        ({
          userB,
          hasBeenConfirmedByUserA,
          hasBeenConfirmedByUserB,
          userBId: _,
          ...mergeAlert
        }) => ({
          ...mergeAlert,
          hasBeenConfirmedByCurrentUser: hasBeenConfirmedByUserA,
          hasBeenConfirmedByOtherUser: hasBeenConfirmedByUserB,
          otherUser: getClientUser({
            ...userB,
            informationVisibility: UserInformationVisibility.ALL_INFO,
          }),
        }),
      ),
      ...user.userMergeAlertUserB.map(
        ({
          userA,
          hasBeenConfirmedByUserA,
          hasBeenConfirmedByUserB,
          userBId: _,
          ...mergeAlert
        }) => ({
          ...mergeAlert,
          hasBeenConfirmedByCurrentUser: hasBeenConfirmedByUserB,
          hasBeenConfirmedByOtherUser: hasBeenConfirmedByUserA,
          otherUser: getClientUser({
            ...userA,
            informationVisibility: UserInformationVisibility.ALL_INFO,
          }),
        }),
      ),
    ],
    userActions: userActions.map(record =>
      getSensitiveDataClientUserAction({ dtsiPeople, record }),
    ),
  }
}

export type PageUserProfileUser = NonNullable<Awaited<ReturnType<typeof getAuthenticatedData>>>
