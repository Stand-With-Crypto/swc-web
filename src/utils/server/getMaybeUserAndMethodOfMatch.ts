'use server'
import { Prisma, UserCryptoAddress, UserEmailAddress } from '@prisma/client'
import { GetResult } from '@prisma/client/runtime/library'
import * as Sentry from '@sentry/nextjs'

import { appRouterGetAuthUser } from '@/utils/server/authentication/appRouterGetAuthUser'
import { prismaClient } from '@/utils/server/prismaClient'
import {
  getUserSessionId,
  getUserSessionIdThatMightNotExist,
} from '@/utils/server/serverUserSessionId'
import { NEXT_PUBLIC_ENVIRONMENT } from '@/utils/shared/sharedEnv'

type PrismaBase = Omit<Prisma.UserFindFirstArgs, 'where'>

type BaseUserAndMethodOfMatch<S extends string | undefined, I extends PrismaBase = PrismaBase> =
  | {
      user: GetResult<Prisma.$UserPayload, I, 'findFirst'>
      userCryptoAddress: UserCryptoAddress | null
      userEmailAddress: UserEmailAddress | null
    }
  | {
      user: GetResult<Prisma.$UserPayload, I, 'findFirst'> | null
      sessionId: S
    }

export type UserAndMethodOfMatch<I extends PrismaBase = PrismaBase> = BaseUserAndMethodOfMatch<
  string,
  I
>

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
  const { include, cursor, distinct, orderBy, skip, take } = prismaConfig || {}
  const authUser = await appRouterGetAuthUser()
  const sessionId =
    // if we got back an auth user, don't throw even if we should because we're gonna match to
    // the auth cookies. I don't know how often this will happen if the root cause is the user blocking cookies
    !authUser && shouldThrowWithoutSession
      ? getUserSessionId()
      : getUserSessionIdThatMightNotExist()
  if (authUser && !sessionId) {
    Sentry.captureMessage('Auth user found but no session id returned, unexpected', {
      extra: { authUser, sessionId },
    })
  }
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
            primaryUserEmailAddress: true,
          },
          cursor,
          distinct,
          orderBy,
          skip,
          take,
          relationLoadStrategy: 'join',
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
            primaryUserEmailAddress: true,
          },
          cursor,
          distinct,
          orderBy,
          skip,
          take,
          relationLoadStrategy: 'join',
        })
      : Promise.resolve(null),
  ])
  const userWithoutReturnTypes = authFoundUser || sessionUser
  const user = userWithoutReturnTypes as GetResult<Prisma.$UserPayload, I, 'findFirst'> | null
  if (authUser) {
    if (!user) {
      if (NEXT_PUBLIC_ENVIRONMENT === 'production') {
        throw new Error(
          `unexpectedly didn't return a user for an authenticated address ${authUser.address!}`,
        )
      } else {
        throw new Error(
          `Didn't return a user for an authenticated address ${authUser.address!}. This is most likely because the database was just wiped in testing/local`,
        )
      }
    }
    const authedCryptoAddress = userWithoutReturnTypes!.userCryptoAddresses.find(
      x => x.cryptoAddress === authUser.address,
    )
    return {
      user,
      userCryptoAddress: authedCryptoAddress ?? null,
      userEmailAddress: userWithoutReturnTypes!.primaryUserEmailAddress ?? null,
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
  return baseGetMaybeUserAndMethodOfMatch({ ...args, shouldThrowWithoutSession: false })
}
