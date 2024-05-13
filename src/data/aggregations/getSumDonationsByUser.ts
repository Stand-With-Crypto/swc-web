import 'server-only'

import { Decimal } from '@prisma/client/runtime/library'
import { compact, keyBy } from 'lodash-es'

import { getClientLeaderboardUser } from '@/clientModels/clientUser/clientLeaderboardUser'
import { getENSDataMapFromCryptoAddressesAndFailGracefully } from '@/data/web3/getENSDataFromCryptoAddress'
import { prismaClient } from '@/utils/server/prismaClient'

export type SumDonationsByUserConfig = {
  limit: number
  offset?: number
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

export async function getSumDonationsByUser(config: SumDonationsByUserConfig) {
  const result = await getSumDonationsByUserQuery(config)
  return getSumDonationsByUserData(result)
}
