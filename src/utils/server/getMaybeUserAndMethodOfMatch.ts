'use server'
import { Prisma, UserCryptoAddress, UserEmailAddress } from '@prisma/client'
import { GetFindResult } from '@prisma/client/runtime/library'
import * as Sentry from '@sentry/nextjs'

import { prismaClient } from '@/utils/server/prismaClient'
import {
  getUserSessionId,
  getUserSessionIdThatMightNotExist,
} from '@/utils/server/serverUserSessionId'
import { appRouterGetAuthUser } from '@/utils/server/thirdweb/appRouterGetAuthUser'
import { NEXT_PUBLIC_ENVIRONMENT } from '@/utils/shared/sharedEnv'

type PrismaBase = Omit<Prisma.UserFindFirstArgs, 'where'>

type BaseUserAndMethodOfMatch<S extends string | undefined, I extends PrismaBase = PrismaBase> =
  | {
      user: GetFindResult<Prisma.$UserPayload, I>
      userCryptoAddress: UserCryptoAddress
    }
  | {
      user: GetFindResult<Prisma.$UserPayload, I> | null
      sessionId: S
    }

export type UserAndMethodOfMatch<I extends PrismaBase = PrismaBase> = BaseUserAndMethodOfMatch<
  string,
  I
>

export type UserAndMethodOfMatchWithMaybeSession<I extends PrismaBase = PrismaBase> =
  BaseUserAndMethodOfMatch<string | undefined, I>
/*
If you're wondering what all the prisma type signatures are for, this allows people to pass additional prismaClient.user.findFirst arguments in
These arguments change the actual shape of the returned result (select and include for example) so we need to use generics to ensure we get the full type-safe result back 
*/
async function baseGetMaybeUserAndMethodOfMatch<
  S extends string | undefined,
  I extends PrismaBase,
>({
  prisma: prismaConfig,
  shouldThrowWithoutSession,
}: {
  shouldThrowWithoutSession: boolean
  prisma?: Prisma.SelectSubset<I, Prisma.UserFindFirstArgs>
}): Promise<BaseUserAndMethodOfMatch<S, I>> {
  const { include, ...other } = prismaConfig || {}
  const authUser = await appRouterGetAuthUser()
  const sessionId = shouldThrowWithoutSession
    ? getUserSessionId()
    : getUserSessionIdThatMightNotExist()
  // PlanetScale currently has index issues when we query for both session and id in the same SQL statement
  // running them separately to make sure we hit our indexes.
  // if we can do this in a single query AND leverage the right indexes in the future this would be ideal.
  const [authFoundUser, sessionUser] = await Promise.all([
    authUser
      ? prismaClient.user.findFirst({
          where: {
            id: authUser.userId,
          },
          include: {
            ...((include || {}) as object),
            userCryptoAddresses: true,
          },
          ...other,
        })
      : Promise.resolve(null),
    sessionId
      ? prismaClient.user.findFirst({
          where: {
            userSessions: { some: { id: sessionId } },
          },
          include: {
            ...((include || {}) as object),
            userCryptoAddresses: true,
          },
          ...other,
        })
      : Promise.resolve(null),
  ])
  const userWithoutReturnTypes = authFoundUser || sessionUser
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
      // @ts-ignore
      const primaryUserEmailAddress = user.primaryUserEmailAddress as UserEmailAddress | undefined
      const isCoinbaseEmployee = primaryUserEmailAddress?.emailAddress?.includes('coinbase.com')
      // This will happen, but should be relatively infrequent
      Sentry.captureMessage(
        `${isCoinbaseEmployee ? 'Coinbase ' : ''}User logged in with a crypto address that is not their primary address`,
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
    sessionId: sessionId as S,
  }
}

export async function getMaybeUserAndMethodOfMatch<I extends PrismaBase>(
  args: {
    prisma?: Prisma.SelectSubset<I, Prisma.UserFindFirstArgs>
  } = {},
): Promise<BaseUserAndMethodOfMatch<string, I>> {
  return baseGetMaybeUserAndMethodOfMatch({ ...args, shouldThrowWithoutSession: true })
}

// useful when you don't want to flag sentry errors for the select few clients who load the site without cookies enabled
export async function getMaybeUserAndMethodOfMatchWithMaybeSession<I extends PrismaBase>(
  args: {
    prisma?: Prisma.SelectSubset<I, Prisma.UserFindFirstArgs>
  } = {},
): Promise<BaseUserAndMethodOfMatch<string | undefined, I>> {
  return baseGetMaybeUserAndMethodOfMatch({ ...args, shouldThrowWithoutSession: true })
}
