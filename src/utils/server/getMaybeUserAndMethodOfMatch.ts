'use server'
import { Prisma, UserCryptoAddress } from '@prisma/client'
import { GetFindResult } from '@prisma/client/runtime/library'
import * as Sentry from '@sentry/nextjs'
import _ from 'lodash'

import { prismaClient } from '@/utils/server/prismaClient'
import { getUserSessionId } from '@/utils/server/serverUserSessionId'
import { appRouterGetAuthUser } from '@/utils/server/thirdweb/appRouterGetAuthUser'
import { NEXT_PUBLIC_ENVIRONMENT } from '@/utils/shared/sharedEnv'

export type UserAndMethodOfMatch<
  I extends Omit<Prisma.UserFindFirstArgs, 'where'> = Omit<Prisma.UserFindFirstArgs, 'where'>,
> =
  | {
      user: GetFindResult<Prisma.$UserPayload, I>
      userCryptoAddress: UserCryptoAddress
    }
  | {
      user: GetFindResult<Prisma.$UserPayload, I> | null
      sessionId: string
    }

/*
If you're wondering what all the prisma type signatures are for, this allows people to pass additional prismaClient.user.findFirst arguments in
These arguments change the actual shape of the returned result (select and include for example) so we need to use generics to ensure we get the full type-safe result back 
*/
export async function getMaybeUserAndMethodOfMatch<
  I extends Omit<Prisma.UserFindFirstArgs, 'where'>,
>({
  include,
  ...other
}: Prisma.SelectSubset<I, Prisma.UserFindFirstArgs>): Promise<UserAndMethodOfMatch<I>> {
  const authUser = await appRouterGetAuthUser()
  const sessionId = getUserSessionId()
  const userWithoutReturnTypes = await prismaClient.user.findFirst({
    where: {
      OR: _.compact([
        authUser && { id: authUser.userId },
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
      if (NEXT_PUBLIC_ENVIRONMENT === 'production') {
        throw new Error(
          `unexpectedly didn't return a user for an authenticated address ${authUser.address}`,
        )
      } else {
        throw new Error(
          `Didn't return a user for an authenticated address ${authUser.address}. This is most likely because the database was just wiped in testing/local`,
        )
      }
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
