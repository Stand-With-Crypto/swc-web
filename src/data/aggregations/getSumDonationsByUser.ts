import 'server-only'

import { UserInformationVisibility } from '@prisma/client'
import { Decimal } from '@prisma/client/runtime/library'
import { compact, keyBy } from 'lodash-es'

import { getClientLeaderboardUser } from '@/clientModels/clientUser/clientLeaderboardUser'
import { getClientModel } from '@/clientModels/utils'
import { getENSDataMapFromCryptoAddressesAndFailGracefully } from '@/data/web3/getENSDataFromCryptoAddress'
import { prismaClient } from '@/utils/server/prismaClient'

export type SumDonationsByUserConfig = {
  limit: number
  offset?: number
  pageNum: number
}


async function getSumDonationsByUserQuery({ limit, offset }: SumDonationsByUserConfig) {
  const total: {
    id: string
    totalDonationAmountUsd: Decimal
  }[] = await prismaClient.user.findMany({
    select: {
      id: true,
      totalDonationAmountUsd: true,
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
  return total.map(({ id, totalDonationAmountUsd }) => ({
    userId: id,
    totalAmountUsd: totalDonationAmountUsd.toNumber(),
  }))
}

type QueryResult = Awaited<ReturnType<typeof getSumDonationsByUserQuery>>

// If we ever have an nft mint action that is not a "donation", we'll need to refactor this logic
async function getSumDonationsByUserData(total: QueryResult) {
  const users = await prismaClient.user.findMany({
    where: {
      id: {
        in: compact(total.map(t => t.userId)),
      },
    },
    include: {
      primaryUserCryptoAddress: true,
      address: true,
    },
  })
  const usersById = keyBy(users, 'id')
  const ensDataMap = await getENSDataMapFromCryptoAddressesAndFailGracefully(
    compact(users.map(user => user.primaryUserCryptoAddress?.cryptoAddress)),
  )
  return total.map(({ userId, totalAmountUsd }) => {
    const user = usersById[userId]
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
  return [moonpay, ...results]
}

export async function getSumDonationsByUser(config: SumDonationsByUserConfig) {
  const result = await getSumDonationsByUserQuery(config)
  const withUserData = await getSumDonationsByUserData(result)

  const isFirstPage = config.pageNum === 1
  return isFirstPage ? manuallyAdjustResults(withUserData) : withUserData
}
