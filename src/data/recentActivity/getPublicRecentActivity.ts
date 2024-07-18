import 'server-only'

import { UserInternalStatus } from '@prisma/client'
import { compact } from 'lodash-es'

import { getClientUserWithENSData } from '@/clientModels/clientUser/clientUser'
import { getClientUserAction } from '@/clientModels/clientUserAction/clientUserAction'
import { queryDTSIPeopleBySlugForUserActions } from '@/data/dtsi/queries/queryDTSIPeopleBySlugForUserActions'
import { getENSDataMapFromCryptoAddressesAndFailGracefully } from '@/data/web3/getENSDataFromCryptoAddress'
import { prismaClient } from '@/utils/server/prismaClient'

interface RecentActivityConfig {
  limit: number
  offset?: number
  restrictToUS?: boolean
}

const fetchFromPrisma = async (config: RecentActivityConfig) => {
  return prismaClient.userAction.findMany({
    orderBy: {
      datetimeCreated: 'desc',
    },
    take: config.restrictToUS ? 1000 : config.limit,
    skip: config.offset,
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
    },
  })
}

export const getPublicRecentActivity = async (config: RecentActivityConfig) => {
  const rawData = await fetchFromPrisma(config)
  const dtsiSlugs = new Set<string>()

  // TODO: this feeds the advocates map at home until a better query at fetchFromPrisma is written
  const filterDataToUSOnly = (data: typeof rawData) => {
    return data
      .filter(currentData => {
        return (
          currentData.user?.address?.countryCode === 'US' &&
          !!currentData.user?.address?.administrativeAreaLevel1
        )
      })
      .slice(0, config?.offset || 0 + config.limit)
  }

  const data = config.restrictToUS ? filterDataToUSOnly(rawData) : rawData

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

  const dtsiPeople = await queryDTSIPeopleBySlugForUserActions(Array.from(dtsiSlugs)).then(
    x => x.people,
  )

  const ensDataMap = await getENSDataMapFromCryptoAddressesAndFailGracefully(
    compact(data.map(({ user }) => user.primaryUserCryptoAddress?.cryptoAddress)),
  )
  return data.map(({ user, ...record }) => ({
    ...getClientUserAction({ record, dtsiPeople }),
    user: {
      ...getClientUserWithENSData(
        user,
        user.primaryUserCryptoAddress?.cryptoAddress
          ? ensDataMap[user.primaryUserCryptoAddress?.cryptoAddress]
          : null,
      ),
    },
  }))
}
export type PublicRecentActivity = Awaited<ReturnType<typeof getPublicRecentActivity>>
