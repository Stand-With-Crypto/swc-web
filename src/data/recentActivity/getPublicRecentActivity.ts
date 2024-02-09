import { getClientUserWithENSData } from '@/clientModels/clientUser/clientUser'
import { getClientUserAction } from '@/clientModels/clientUserAction/clientUserAction'
import { queryDTSIPeopleBySlugForUserActions } from '@/data/dtsi/queries/queryDTSIPeopleBySlugForUserActions'
import { getENSDataMapFromCryptoAddressesAndFailGracefully } from '@/data/web3/getENSDataFromCryptoAddress'
import { prismaClient } from '@/utils/server/prismaClient'
import { UserInternalStatus } from '@prisma/client'
import _ from 'lodash'
import 'server-only'

interface RecentActivityConfig {
  limit: number
  offset?: number
}

const fetchFromPrisma = async (config: RecentActivityConfig) => {
  return prismaClient.userAction.findMany({
    include: {
      nftMint: true,
      user: {
        include: { primaryUserCryptoAddress: true },
      },
      userActionCall: true,
      userActionDonation: true,
      userActionEmail: {
        include: {
          userActionEmailRecipients: true,
        },
      },
      userActionOptIn: true,
    },
    orderBy: {
      datetimeCreated: 'desc',
    },
    skip: config.offset,
    take: config.limit,
    where: {
      user: {
        internalStatus: UserInternalStatus.VISIBLE,
      },
    },
  })
}

export const getPublicRecentActivity = async (config: RecentActivityConfig) => {
  const data = await fetchFromPrisma(config)
  const dtsiSlugs = new Set<string>()
  data.forEach(userAction => {
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
  const ensDataMap = await getENSDataMapFromCryptoAddressesAndFailGracefully(
    _.compact(data.map(({ user }) => user.primaryUserCryptoAddress?.cryptoAddress)),
  )
  return data.map(({ user, ...record }) => ({
    ...getClientUserAction({ dtsiPeople, record }),
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
