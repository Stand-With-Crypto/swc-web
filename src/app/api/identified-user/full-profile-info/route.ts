import { getClientAddress } from '@/clientModels/clientAddress'
import { getClientUser } from '@/clientModels/clientUser/clientUser'
import { getSensitiveDataClientUser } from '@/clientModels/clientUser/sensitiveDataClientUser'
import { getMaybeUserAndMethodOfMatch } from '@/utils/server/getMaybeUserAndMethodOfMatch'
import _ from 'lodash'
import { NextResponse } from 'next/server'
import 'server-only'

export const dynamic = 'force-dynamic'

export async function apiResponseForUserFullProfileInfo() {
  const { user } = await getMaybeUserAndMethodOfMatch({
    include: {
      userCryptoAddress: true,
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

export async function GET() {
  const response = await apiResponseForUserFullProfileInfo()
  return NextResponse.json(response)
}
