import { NextResponse } from 'next/server'

import {
  getSensitiveDataClientUserAction,
  SensitiveDataClientUserAction,
} from '@/clientModels/clientUserAction/sensitiveDataClientUserAction'
import { getMaybeUserAndMethodOfMatchWithMaybeSession } from '@/utils/server/getMaybeUserAndMethodOfMatch'
import { getLogger } from '@/utils/shared/logger'

const logger = getLogger('api/internal/user-actions')

export const revalidate = 0

export async function GET() {
  try {
    const { user } = await getMaybeUserAndMethodOfMatchWithMaybeSession({
      prisma: {
        include: {
          userActions: {
            include: {
              userActionEmail: {
                include: {
                  address: true,
                  userActionEmailRecipients: true,
                },
              },
              nftMint: true,
              userActionCall: true,
              userActionDonation: true,
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
              userActionViewKeyPage: true,
            },
            orderBy: {
              datetimeCreated: 'desc',
            },
          },
        },
      },
    })

    if (!user) {
      return NextResponse.json({ userActions: [] })
    }

    const userActions: SensitiveDataClientUserAction[] = user.userActions.map((record: any) =>
      getSensitiveDataClientUserAction({ record }),
    )

    return NextResponse.json({ userActions })
  } catch (error) {
    logger.error('Error fetching user actions for internal page:', error)
    return NextResponse.json(
      { error: 'Failed to fetch user actions for internal page' },
      { status: 500 },
    )
  }
}
