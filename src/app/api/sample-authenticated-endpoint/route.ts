// TODO migrate to app router once thirdweb supports it

import { getClientCryptoAddressUser } from '@/clientModels/clientCryptoAddressUser'
import { appRouterGetAuthUser } from '@/utils/server/appRouterGetAuthUser'
import { prismaClient } from '@/utils/server/prismaClient'
import { thirdWebAuth } from '@/utils/server/thirdWebAuth'
import { NextApiRequest, NextApiResponse } from 'next'
import { NextRequest, NextResponse } from 'next/server'

// TODO move to server action
export async function POST(_request: NextRequest) {
  const authUser = await appRouterGetAuthUser()
  if (!authUser) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  }
  let user = await prismaClient.cryptoAddressUser.findUniqueOrThrow({
    where: {
      cryptoAddress: authUser.address,
    },
  })
  user = await prismaClient.cryptoAddressUser.update({
    where: {
      cryptoAddress: authUser.address,
    },
    data: {
      sampleDatabaseIncrement: user.sampleDatabaseIncrement + 1,
    },
  })
  return NextResponse.json(getClientCryptoAddressUser(user))
}
