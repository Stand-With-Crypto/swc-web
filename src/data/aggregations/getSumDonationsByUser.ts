import 'server-only'

import { UserInformationVisibility } from '@prisma/client'
import { compact, keyBy } from 'lodash-es'

import { getClientLeaderboardUser } from '@/clientModels/clientUser/clientLeaderboardUser'
import { getClientModel } from '@/clientModels/utils'
import { getENSDataMapFromCryptoAddressesAndFailGracefully } from '@/data/web3/getENSDataFromCryptoAddress'
import { prismaClient } from '@/utils/server/prismaClient'

type SumDonationsByUserConfig = {
  limit: number
  offset?: number
  pageNum: number
}

async function getSumDonationsByUserQuery({ limit, offset }: SumDonationsByUserConfig) {
  const total = await prismaClient.user.findMany({
    select: {
      id: true,
      totalDonationAmountUsd: true,
      firstName: true,
      lastName: true,
      informationVisibility: true,
      primaryUserCryptoAddress: true,
      address: {
        select: {
          administrativeAreaLevel1: true,
          countryCode: true,
        },
      },
    },
    where: {
      internalStatus: 'VISIBLE',
      totalDonationAmountUsd: {
        gt: 0,
      },
    },
    orderBy: {
      totalDonationAmountUsd: 'desc',
    },
    take: limit,
    ...(offset ? { skip: offset } : {}),
  })
  return total.map(({ totalDonationAmountUsd, ...rest }) => ({
    totalAmountUsd: totalDonationAmountUsd.toNumber(),
    ...rest,
  }))
}

type QueryResult = Awaited<ReturnType<typeof getSumDonationsByUserQuery>>

// If we ever have an nft mint action that is not a "donation", we'll need to refactor this logic
async function getSumDonationsByUserData(total: QueryResult) {
  const usersById = keyBy(total, 'id')
  const ensDataMap = await getENSDataMapFromCryptoAddressesAndFailGracefully(
    compact(total.map(user => user.primaryUserCryptoAddress?.cryptoAddress)),
  )
  return total.map(({ id, totalAmountUsd }) => {
    const user = usersById[id]
    return {
      totalAmountUsd: totalAmountUsd,
      user: {
        ...getClientLeaderboardUser(
          user,
          user.primaryUserCryptoAddress?.cryptoAddress
            ? ensDataMap[user.primaryUserCryptoAddress?.cryptoAddress]
            : null,
        ),
      },
    }
  })
}
export type SumDonationsByUser = Awaited<ReturnType<typeof getSumDonationsByUserData>>

function manuallyAdjustResults(results: SumDonationsByUser) {
  const moonpay: SumDonationsByUser[0] = {
    totalAmountUsd: 1_000_000,
    user: getClientModel({
      id: 'manually-added-moonpay',
      firstName: null,
      lastName: null,
      informationVisibility: UserInformationVisibility.ALL_INFO,
      primaryUserCryptoAddress: null,
      manuallySetInformation: {
        displayName: 'MoonPay',
        profilePictureUrl: '/userManuallySetInformation/moonpay.png',
      },
    }),
  }
  const exodus: SumDonationsByUser[0] = {
    totalAmountUsd: 1_300_000,
    user: getClientModel({
      id: 'manually-added-exodus',
      firstName: null,
      lastName: null,
      informationVisibility: UserInformationVisibility.ALL_INFO,
      primaryUserCryptoAddress: null,
      manuallySetInformation: {
        displayName: 'Exodus',
        profilePictureUrl: '/userManuallySetInformation/exodus.jpg',
      },
    }),
  }
  return [exodus, moonpay, ...results]
}

export async function getSumDonationsByUser(config: SumDonationsByUserConfig) {
  const result = await getSumDonationsByUserQuery(config)
  const withUserData = await getSumDonationsByUserData(result)

  const isFirstPage = config.pageNum === 1
  return isFirstPage ? manuallyAdjustResults(withUserData) : withUserData
}
