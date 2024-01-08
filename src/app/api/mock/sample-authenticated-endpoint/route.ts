// TODO migrate to app router once thirdweb supports it

import { getClientUser } from '@/clientModels/clientUser/clientUser'
import { appRouterGetAuthUser } from '@/utils/server/appRouterGetAuthUser'
import { prismaClient } from '@/utils/server/prismaClient'
import { thirdWebAuth } from '@/utils/server/thirdWebAuth'
import { NextApiRequest, NextApiResponse } from 'next'
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
      userCryptoAddress: { address: authUser.address },
    },
    include: { userCryptoAddress: true },
  })
  user = await prismaClient.user.update({
    where: {
      id: user.id,
    },
    data: {
      sampleDatabaseIncrement: user.sampleDatabaseIncrement + 1,
    },
    include: { userCryptoAddress: true },
  })
  return NextResponse.json(getClientUser(user))
}
