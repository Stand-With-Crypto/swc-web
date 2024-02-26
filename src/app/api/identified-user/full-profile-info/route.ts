import 'server-only'

import { NextResponse } from 'next/server'

import { getClientAddress } from '@/clientModels/clientAddress'
import { getSensitiveDataClientUser } from '@/clientModels/clientUser/sensitiveDataClientUser'
import { getMaybeUserAndMethodOfMatchWithMaybeSession } from '@/utils/server/getMaybeUserAndMethodOfMatch'

export const dynamic = 'force-dynamic'

async function apiResponseForUserFullProfileInfo() {
  const { user } = await getMaybeUserAndMethodOfMatchWithMaybeSession({
    prisma: {
      include: {
        primaryUserCryptoAddress: true,
        primaryUserEmailAddress: true,
        address: true,
      },
    },
  })

  return {
    user: user && {
      ...getSensitiveDataClientUser(user),
      address: user.address && getClientAddress(user.address),
    },
  }
}

export type GetUserFullProfileInfoResponse = Awaited<
  ReturnType<typeof apiResponseForUserFullProfileInfo>
>

export async function GET() {
  const response = await apiResponseForUserFullProfileInfo()
  return NextResponse.json(response)
}
