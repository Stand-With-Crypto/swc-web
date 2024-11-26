import { UserInternalStatus } from '@prisma/client'

import { runBin } from '@/bin/runBin'
import { getCountPolicymakerContacts } from '@/data/aggregations/getCountPolicymakerContacts'
import { getCountUsers } from '@/data/aggregations/getCountUsers'
import { getSumDonations } from '@/data/aggregations/getSumDonations'
import { prismaClient } from '@/utils/server/prismaClient'

const USER_ID = '3077b286-f6ba-453b-b906-1f9d6c83b224'

async function criticalQueriesMetrics() {
  let start = performance.now()

  // api/identified-user/full-profile-info/route.ts
  await prismaClient.user.findFirst({
    where: {
      id: USER_ID,
    },
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
          userActionVotingDay: true,
        },
      },

      userCryptoAddresses: true,
    },
  })

  let end = performance.now()
  console.log(`api/identified-user/full-profile-info/route.ts: ${end - start}ms`)

  // ********************************************************************************************************************

  start = performance.now()
  // getAdvocatesMapData - fetchAllFromPrisma
  await prismaClient.$queryRaw`
    SELECT
      address.administrative_area_level_1 AS state,
      COUNT(user.id) AS totalAdvocates
    FROM address
    JOIN user ON user.address_id = address.id
    WHERE address.country_code = 'US'
    AND address.administrative_area_level_1 != ''
    GROUP BY address.administrative_area_level_1;
  `
  end = performance.now()
  console.log(`getAdvocatesMapData - fetchAllFromPrisma: ${end - start}ms`)

  // ********************************************************************************************************************

  start = performance.now()
  // api/public/homepage/top-level-metrics/route.ts
  await Promise.all([getSumDonations(), getCountUsers(), getCountPolicymakerContacts()])

  end = performance.now()
  console.log(`api/public/homepage/top-level-metrics/route.ts: ${end - start}ms`)

  // ********************************************************************************************************************

  start = performance.now()
  // api/public/recent-activity/route.ts
  await prismaClient.userAction.findMany({
    orderBy: {
      datetimeCreated: 'desc',
    },
    where: {
      user: {
        internalStatus: UserInternalStatus.VISIBLE,
      },
    },
    include: {
      user: {
        include: { primaryUserCryptoAddress: true, address: true },
      },
      userActionEmail: {
        include: {
          userActionEmailRecipients: true,
        },
      },
      nftMint: true,
      userActionCall: true,
      userActionDonation: true,
      userActionOptIn: true,
      userActionVoterRegistration: true,
      userActionTweetAtPerson: true,
      userActionVoterAttestation: true,
      userActionRsvpEvent: true,
      userActionViewKeyRaces: true,
      userActionVotingInformationResearched: {
        include: {
          address: true,
        },
      },
      userActionVotingDay: true,
    },
    take: 10000,
  })

  end = performance.now()
  console.log(`api/public/recent-activity/route.ts: ${end - start}ms`)
}

void runBin(criticalQueriesMetrics)
