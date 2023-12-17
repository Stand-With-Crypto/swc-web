// TODO migrate to app router once thirdweb supports it

import { getClientCryptoAddressUser } from '@/clientModels/clientUser'
import { prismaClient } from '@/utils/server/prismaClient'
import { thirdWebAuth } from '@/utils/server/thirdWebAuth'
import { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(request: NextApiRequest, res: NextApiResponse) {
  const sessionUser = await thirdWebAuth.getUser(request)
  if (!sessionUser) {
    return res.status(401).json({ message: 'Unauthorized' })
  }
  let user = await prismaClient.cryptoAddressUser.findUniqueOrThrow({
    where: {
      address: sessionUser.address,
    },
  })
  user = await prismaClient.cryptoAddressUser.update({
    where: {
      address: sessionUser.address,
    },
    data: {
      sampleDatabaseIncrement: user.sampleDatabaseIncrement + 1,
    },
  })
  return res.json(getClientCryptoAddressUser(user))
}
