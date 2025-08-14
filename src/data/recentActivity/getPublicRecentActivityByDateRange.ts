import 'server-only'

import { Prisma, UserInternalStatus } from '@prisma/client'
import { compact } from 'lodash-es'

import { getClientUserWithENSData } from '@/clientModels/clientUser/clientUser'
import { getClientUserAction } from '@/clientModels/clientUserAction/clientUserAction'
import { queryDTSIPeopleBySlugForUserActions } from '@/data/dtsi/queries/queryDTSIPeopleBySlugForUserActions'
import { getENSDataMapFromCryptoAddressesAndFailGracefully } from '@/data/web3/getENSDataFromCryptoAddress'
import { prismaClient } from '@/utils/server/prismaClient'

interface RecentActivityByDateRangeConfig {
  startDate: string
  endDate: string
  offset: number
  countryCode: string
}

// The reason this is duplicate from `./getPublicRecentActivity.ts` is because this is for external use and
// we don't want to arbitrarily change the data that is returned when new actions are added.
const fetchFromPrisma = async (config: RecentActivityByDateRangeConfig) => {
  const where: Prisma.UserActionWhereInput = {
    countryCode: config.countryCode,
    datetimeCreated: {
      gte: new Date(config.startDate),
      lte: new Date(config.endDate),
    },
  }

  const [data, count] = await Promise.all([
    prismaClient.userAction
      .findMany({
        orderBy: {
          datetimeCreated: 'desc',
        },
        take: 1000,
        skip: config.offset,
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
          userActionRefer: true,
          userActionPoll: {
            include: {
              userActionPollAnswers: true,
            },
          },
          userActionViewKeyPage: true,
        },
        where,
      })
      .then(userActions =>
        userActions.filter(
          ({ user: { internalStatus } }) => internalStatus === UserInternalStatus.VISIBLE,
        ),
      ),
    prismaClient.userAction.count({ where }),
  ])

  return { count, data }
}

export const getPublicRecentActivityByDateRange = async (
  config: RecentActivityByDateRangeConfig,
) => {
  const { count, data } = await fetchFromPrisma(config)
  const dtsiSlugs = new Set<string>()

  data.forEach(userAction => {
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

  const dtsiPeopleQuery = await queryDTSIPeopleBySlugForUserActions(Array.from(dtsiSlugs))

  if (!dtsiPeopleQuery) {
    return {
      count: 0,
      data: [],
    }
  }

  const ensDataMap = await getENSDataMapFromCryptoAddressesAndFailGracefully(
    compact(data.map(({ user }) => user.primaryUserCryptoAddress?.cryptoAddress)),
  )
  return {
    count,
    data: data.map(({ user, ...record }) => ({
      ...getClientUserAction({ record, dtsiPeople: dtsiPeopleQuery.people }),
      user: {
        ...getClientUserWithENSData(
          user,
          user.primaryUserCryptoAddress?.cryptoAddress
            ? ensDataMap[user.primaryUserCryptoAddress?.cryptoAddress]
            : null,
        ),
      },
    })),
  }
}

export type PublicRecentActivityByDateRange = Awaited<
  ReturnType<typeof getPublicRecentActivityByDateRange>
>
