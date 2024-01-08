'use server'
import { appRouterGetAuthUser } from '@/utils/server/appRouterGetAuthUser'
import { getUserSessionIdOnAppRouter } from '@/utils/server/serverUserSessionId'
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
  const sessionId = getUserSessionIdOnAppRouter()
  const userWithoutReturnTypes = await prismaClient.user.findFirst({
    where: {
      OR: _.compact([
        authUser && { userCryptoAddress: { address: authUser.address } },
        { userSessions: { some: { id: sessionId } } },
      ]),
    },
    include: {
      ...((include || {}) as object),
      userCryptoAddress: true,
    },
    ...other,
  })
  const user = userWithoutReturnTypes as GetFindResult<Prisma.$UserPayload, I> | null
  if (authUser) {
    if (!user) {
      throw new Error(
        `unexpectedly didn't return a user for an authenticated address ${authUser.address}}`,
      )
    }
    return {
      user,
      userCryptoAddress: userWithoutReturnTypes!.userCryptoAddress!,
    }
  }
  return {
    user,
    sessionId,
  }
}
