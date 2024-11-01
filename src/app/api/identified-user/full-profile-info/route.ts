import 'server-only'

import { NextResponse } from 'next/server'

import { getClientAddress } from '@/clientModels/clientAddress'
import { getSensitiveDataClientUser } from '@/clientModels/clientUser/sensitiveDataClientUser'
import { getSensitiveDataClientUserAction } from '@/clientModels/clientUserAction/sensitiveDataClientUserAction'
import { getMaybeUserAndMethodOfMatchWithMaybeSession } from '@/utils/server/getMaybeUserAndMethodOfMatch'
import { withRouteMiddleware } from '@/utils/server/serverWrappers/withRouteMiddleware'

export const dynamic = 'force-dynamic'

async function apiResponseForUserFullProfileInfo() {
  const { user } = await getMaybeUserAndMethodOfMatchWithMaybeSession({
    prisma: {
      include: {
        primaryUserCryptoAddress: true,
        primaryUserEmailAddress: true,
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

  return {
    user: user && {
      ...getSensitiveDataClientUser(user),
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
