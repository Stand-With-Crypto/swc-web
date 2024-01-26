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
    where: {
      id: authUser.userId,
    },
    include: {
      userMergeAlertUserA: { include: { userB: { include: { primaryUserCryptoAddress: true } } } },
      userMergeAlertUserB: { include: { userA: { include: { primaryUserCryptoAddress: true } } } },
      primaryUserCryptoAddress: true,
      userCryptoAddresses: true,
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
          nftMint: true,
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
    // LATER-TASK show UX if this address is not the primary address
    currentlyAuthenticatedUserCryptoAddress: getClientUserCryptoAddress(
      currentlyAuthenticatedUserCryptoAddress,
    ),

    address: address && getClientAddress(address),
    userActions: userActions.map(record =>
      getSensitiveDataClientUserAction({ record, dtsiPeople }),
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
          hasBeenConfirmedByOtherUser: hasBeenConfirmedByUserB,
          hasBeenConfirmedByCurrentUser: hasBeenConfirmedByUserA,
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
  }
}

export type PageUserProfileUser = NonNullable<Awaited<ReturnType<typeof getAuthenticatedData>>>
