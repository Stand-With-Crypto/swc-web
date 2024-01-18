import { getClientAddress } from '@/clientModels/clientAddress'
import { getSensitiveDataClientUser } from '@/clientModels/clientUser/sensitiveDataClientUser'
import { getMaybeUserAndMethodOfMatch } from '@/utils/server/getMaybeUserAndMethodOfMatch'
import { NextResponse } from 'next/server'
import 'server-only'

export const dynamic = 'force-dynamic'

async function apiResponseForUserFullProfileInfo() {
  const { user } = await getMaybeUserAndMethodOfMatch({
    include: {
      primaryUserCryptoAddress: true,
      primaryUserEmailAddress: true,
      address: true,
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
