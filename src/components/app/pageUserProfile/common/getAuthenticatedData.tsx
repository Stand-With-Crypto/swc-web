import 'server-only'

import { UserInformationVisibility } from '@prisma/client'

import { getClientAddress } from '@/clientModels/clientAddress'
import { getClientUser } from '@/clientModels/clientUser/clientUser'
import { getClientUserCryptoAddress } from '@/clientModels/clientUser/clientUserCryptoAddress'
import { getSensitiveDataClientUserWithENSData } from '@/clientModels/clientUser/sensitiveDataClientUser'
import { getSensitiveDataClientUserAction } from '@/clientModels/clientUserAction/sensitiveDataClientUserAction'
import { getENSDataFromCryptoAddressAndFailGracefully } from '@/data/web3/getENSDataFromCryptoAddress'
import { appRouterGetAuthUser } from '@/utils/server/authentication/appRouterGetAuthUser'
import { prismaClient } from '@/utils/server/prismaClient'

export async function getAuthenticatedData() {
  const authUser = await appRouterGetAuthUser()
  if (!authUser) {
    return null
  }

  const userPromise = await prismaClient.user.findFirstOrThrow({
    where: {
      id: authUser.userId,
    },
    include: {
      primaryUserCryptoAddress: true,
      userCryptoAddresses: true,
      address: true,
      primaryUserEmailAddress: true,
    },
  })

  const userMergeAlertUserAPromise = prismaClient.userMergeAlert.findMany({
    where: { userAId: authUser.userId },
    include: { userB: { include: { primaryUserCryptoAddress: true, address: true } } },
  })

  const userMergeAlertUserBPromise = prismaClient.userMergeAlert.findMany({
    where: { userBId: authUser.userId },
    include: { userA: { include: { primaryUserCryptoAddress: true, address: true } } },
  })

  const userActionsPromise = prismaClient.userAction.findMany({
    where: { userId: authUser.userId },
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
      userActionVoterRegistration: true,
      userActionTweetAtPerson: true,
      userActionRsvpEvent: true,
      userActionVoterAttestation: true,
      userActionViewKeyRaces: true,
      userActionVotingInformationResearched: {
        include: {
          address: true,
        },
      },
      userActionVotingDay: true,
      userActionRefer: true,
      userActionPoll: {
        include: {
          userActionPollAnswers: true,
        },
      },
    },
  })

  const [user, userMergeAlertUserA, userMergeAlertUserB, userActions] = await Promise.all([
    userPromise,
    userMergeAlertUserAPromise,
    userMergeAlertUserBPromise,
    userActionsPromise,
  ])

  const dtsiSlugs = new Set<string>()
  userActions.forEach(userAction => {
    if (userAction.userActionCall?.recipientDtsiSlug) {
      dtsiSlugs.add(userAction.userActionCall.recipientDtsiSlug)
    } else if (userAction.userActionEmail) {
      userAction.userActionEmail.userActionEmailRecipients.forEach(userActionEmailRecipient => {
        if (userActionEmailRecipient.dtsiSlug) {
          dtsiSlugs.add(userActionEmailRecipient.dtsiSlug)
        }
      })
    } else if (userAction.userActionTweetAtPerson?.recipientDtsiSlug) {
      dtsiSlugs.add(userAction.userActionTweetAtPerson.recipientDtsiSlug)
    }
  })
  const ensData = user.primaryUserCryptoAddress
    ? await getENSDataFromCryptoAddressAndFailGracefully(
        user.primaryUserCryptoAddress.cryptoAddress,
      )
    : null
  const { address, ...rest } = user
  const currentlyAuthenticatedUserCryptoAddress = user.userCryptoAddresses.find(
    x => x.cryptoAddress === authUser.address,
  )

  return {
    ...getSensitiveDataClientUserWithENSData({ ...rest, address }, ensData),
    // LATER-TASK show UX if this address is not the primary address
    currentlyAuthenticatedUserCryptoAddress: currentlyAuthenticatedUserCryptoAddress
      ? getClientUserCryptoAddress(currentlyAuthenticatedUserCryptoAddress)
      : null,

    address: address && getClientAddress(address),
    userActions: userActions.map(record => getSensitiveDataClientUserAction({ record })),
    mergeAlerts: [
      ...userMergeAlertUserA.map(
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
      ...userMergeAlertUserB.map(
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
