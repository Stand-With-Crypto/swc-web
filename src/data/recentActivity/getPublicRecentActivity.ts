import 'server-only'
import { prismaClient } from '@/utils/server/prismaClient'
import { getClientUserAction } from '@/clientModels/clientUserAction/clientUserAction'
import { queryDTSIPeopleBySlugForUserActions } from '@/data/dtsi/queries/queryDTSIPeopleBySlugForUserActions'
import { getClientCryptoAddressUser } from '@/clientModels/clientCryptoAddress/clientCryptoAddressUser'

interface RecentActivityConfig {
  limit: number
}

const fetchFromPrisma = async (config: RecentActivityConfig) => {
  return prismaClient.userAction.findMany({
    orderBy: {
      datetimeOccurred: 'desc',
    },
    take: config.limit,
    include: {
      cryptoAddressUser: true,
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
  return data.map(({ cryptoAddressUser, ...record }) => ({
    ...getClientUserAction({ record, dtsiPeople }),
    cryptoAddressUser: cryptoAddressUser && getClientCryptoAddressUser(cryptoAddressUser),
  }))
}
