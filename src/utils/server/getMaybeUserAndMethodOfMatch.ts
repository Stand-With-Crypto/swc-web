'use server'
import * as Sentry from '@sentry/nextjs'
import { appRouterGetAuthUser } from '@/utils/server/appRouterGetAuthUser'
import { getUserSessionId } from '@/utils/server/serverUserSessionId'
import { prismaClient } from '@/utils/server/prismaClient'
import { Prisma, User, UserCryptoAddress } from '@prisma/client'
import _ from 'lodash'
import { GetFindResult } from '@prisma/client/runtime/library'

/*
If you're wondering what all the prisma type signatures are for, this allows people to pass additional prismaClient.user.findFirst arguments in
These arguments change the actual shape of the returned result (select and include for example) so we need to use generics to ensure we get the full type-safe result back 
*/
export async function getMaybeUserAndMethodOfMatch<
  I extends Omit<Prisma.UserFindFirstArgs, 'where'>,
>({
  include,
  ...other
}: Prisma.SelectSubset<I, Prisma.UserFindFirstArgs>): Promise<
  | {
      user: GetFindResult<Prisma.$UserPayload, I>
      userCryptoAddress: UserCryptoAddress
    }
  | {
      user: GetFindResult<Prisma.$UserPayload, I> | null
      sessionId: string
    }
> {
  const authUser = await appRouterGetAuthUser()
  const sessionId = getUserSessionId()
  const userWithoutReturnTypes = await prismaClient.user.findFirst({
    where: {
      OR: _.compact([
        authUser && { userCryptoAddresses: { some: { cryptoAddress: authUser.address } } },
        { userSessions: { some: { id: sessionId } } },
      ]),
    },
    include: {
      ...((include || {}) as object),
      userCryptoAddresses: true,
    },
    ...other,
  })
  const user = userWithoutReturnTypes as GetFindResult<Prisma.$UserPayload, I> | null
  if (authUser) {
    if (!user) {
      throw new Error(
        `unexpectedly didn't return a user for an authenticated address ${authUser.address}`,
      )
    }
    const authedCryptoAddress = userWithoutReturnTypes!.userCryptoAddresses.find(
      x => x.cryptoAddress === authUser.address,
    )!
    if (authedCryptoAddress.id !== user.primaryUserCryptoAddressId) {
      // This will happen, but should be relatively infrequent
      Sentry.captureMessage(
        'User logged in with a crypto address that is not their primary address',
        { extra: { user, address: authUser.address } },
      )
    }
    return {
      user,
      userCryptoAddress: authedCryptoAddress,
    }
  }
  return {
    user,
    sessionId,
  }
}
