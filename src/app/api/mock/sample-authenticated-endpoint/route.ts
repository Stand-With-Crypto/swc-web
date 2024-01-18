// TODO migrate to app router once thirdweb supports it

import { getClientUser } from '@/clientModels/clientUser/clientUser'
import { prismaClient } from '@/utils/server/prismaClient'
import { appRouterGetAuthUser } from '@/utils/server/thirdweb/appRouterGetAuthUser'
import { NextRequest, NextResponse } from 'next/server'
import 'server-only'

// TODO move to server action
export async function POST(_request: NextRequest) {
  const authUser = await appRouterGetAuthUser()
  if (!authUser) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  }
  let user = await prismaClient.user.findFirstOrThrow({
    where: {
      userCryptoAddresses: { some: { cryptoAddress: authUser.address } },
    },
    include: { primaryUserCryptoAddress: true },
  })
  user = await prismaClient.user.update({
    where: {
      id: user.id,
    },
    data: {
      sampleDatabaseIncrement: user.sampleDatabaseIncrement + 1,
    },
    include: { primaryUserCryptoAddress: true },
  })
  return NextResponse.json(getClientUser(user))
}
