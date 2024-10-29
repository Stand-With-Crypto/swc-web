import 'server-only'

import { UserCryptoAddress, UserEmailAddress } from '@prisma/client'
import { NextResponse } from 'next/server'

import { getClientAddress } from '@/clientModels/clientAddress'
import { getSensitiveDataClientUser } from '@/clientModels/clientUser/sensitiveDataClientUser'
import { getSensitiveDataClientUserAction } from '@/clientModels/clientUserAction/sensitiveDataClientUserAction'
import { getMaybeUserAndMethodOfMatchWithMaybeSession } from '@/utils/server/getMaybeUserAndMethodOfMatch'
import { prismaClient } from '@/utils/server/prismaClient'
import { withRouteMiddleware } from '@/utils/server/serverWrappers/withRouteMiddleware'

export const dynamic = 'force-dynamic'

async function apiResponseForUserFullProfileInfo() {
  const { user } = await getMaybeUserAndMethodOfMatchWithMaybeSession({
    prisma: {
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
          },
        },
      },
    },
  })

  let primaryUserEmailAddress: UserEmailAddress | null = null
  let primaryUserCryptoAddress: UserCryptoAddress | null = null

  if (user?.id) {
    const results = await Promise.all([
      prismaClient.userEmailAddress.findFirst({
        where: { userId: user?.id },
      }),
      prismaClient.userCryptoAddress.findFirst({
        where: { userId: user?.id },
      }),
    ])

    primaryUserEmailAddress = results[0]
    primaryUserCryptoAddress = results[1]
  }

  return {
    user: user && {
      ...getSensitiveDataClientUser({
        ...user,
        primaryUserEmailAddress,
        primaryUserCryptoAddress,
      }),
      address: user.address && getClientAddress(user.address),
      userActions: user.userActions.map(record => getSensitiveDataClientUserAction({ record })),
    },
  }
}

export type GetUserFullProfileInfoResponse = Awaited<
  ReturnType<typeof apiResponseForUserFullProfileInfo>
>

export const GET = withRouteMiddleware(async () => {
  const response = await apiResponseForUserFullProfileInfo()
  return NextResponse.json(response)
})
