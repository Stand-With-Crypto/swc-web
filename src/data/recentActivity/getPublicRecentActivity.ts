import 'server-only'
import { prismaClient } from '@/utils/server/prismaClient'
import { getClientUserAction } from '@/clientModels/clientUserAction/clientUserAction'
import { queryDTSIPeopleBySlugForUserActions } from '@/data/dtsi/queries/queryDTSIPeopleBySlugForUserActions'
import { getClientUser, getClientUserWithENSData } from '@/clientModels/clientUser/clientUser'
import { getENSDataMapFromCryptoAddressesAndFailGracefully } from '@/data/web3/getENSDataFromCryptoAddress'
import _ from 'lodash'

interface RecentActivityConfig {
  limit: number
  offset?: number
}

const fetchFromPrisma = async (config: RecentActivityConfig) => {
  return prismaClient.userAction.findMany({
    orderBy: {
      datetimeCreated: 'desc',
    },
    take: config.limit,
    skip: config.offset,
    include: {
      user: {
        include: { userCryptoAddress: true },
      },
      userActionEmail: {
        include: {
          userActionEmailRecipients: true,
        },
      },
      nftMint: {
        include: { nft: true },
      },
      userActionCall: true,
      userActionDonation: true,
      userActionOptIn: true,
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
    _.compact(data.map(({ user }) => user.userCryptoAddress?.address)),
  )
  return data.map(({ user, ...record }) => ({
    ...getClientUserAction({ record, dtsiPeople }),
    user: {
      ...getClientUserWithENSData(
        user,
        user.userCryptoAddress?.address ? ensDataMap[user.userCryptoAddress?.address] : null,
      ),
    },
  }))
}
