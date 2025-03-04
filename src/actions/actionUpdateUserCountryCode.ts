'use server'
import 'server-only'

import * as Sentry from '@sentry/nextjs'
import { cookies } from 'next/headers'
import { waitUntil } from 'node_modules/@vercel/functions/wait-until'
import { z } from 'zod'

import { appRouterGetAuthUser } from '@/utils/server/authentication/appRouterGetAuthUser'
import { USER_COUNTRY_CODE_COOKIE_NAME } from '@/utils/server/getCountryCode'
import { prismaClient } from '@/utils/server/prismaClient'
import { throwIfRateLimited } from '@/utils/server/ratelimit/throwIfRateLimited'
import { getServerAnalytics } from '@/utils/server/serverAnalytics/serverAnalytics'
import { getServerPeopleAnalytics } from '@/utils/server/serverAnalytics/serverPeopleAnalytics'
import { parseLocalUserFromCookies } from '@/utils/server/serverLocalUser'
import { getUserSessionId } from '@/utils/server/serverUserSessionId'
import { withServerActionMiddleware } from '@/utils/server/serverWrappers/withServerActionMiddleware'
import { getLogger } from '@/utils/shared/logger'
import { zodSupportedCountryCode } from '@/validation/fields/zodSupportedCountryCode'

export const actionUpdateUserCountryCode = withServerActionMiddleware(
  'actionUpdateUserCountryCode',
  actionUpdateUserCountryCodeWithoutMiddleware,
)

const logger = getLogger(`actionUpdateUserCountryCode`)

export async function actionUpdateUserCountryCodeWithoutMiddleware(
  countryCode: z.infer<typeof zodSupportedCountryCode>,
) {
  const sessionId = await getUserSessionId()
  const authUser = await appRouterGetAuthUser()

  if (!authUser) {
    const error = new Error("User's Country Code update failed - Not authenticated")

    logger.error(error.message)

    Sentry.captureException(error, {
      tags: { domain: 'actionUpdateUserCountryCode' },
      extra: {
        sessionId,
      },
    })

    return {
      errors: {
        countryCode: [error.message],
      },
    }
  }

  const validatedFields = zodSupportedCountryCode.safeParse(countryCode)
  if (!validatedFields.success) {
    const error = new Error("User's Country Code update failed - Country code is not supported")

    logger.error(error.message)

    Sentry.captureException(error, {
      tags: { domain: 'actionUpdateUserCountryCode' },
      extra: {
        sessionId,
        countryCode,
      },
    })

    return {
      errors: {
        countryCode: [error.message],
      },
    }
  }

  await throwIfRateLimited({ context: 'authenticated' })

  const user = await prismaClient.user.findFirstOrThrow({
    where: {
      id: authUser.userId,
    },
    select: {
      countryCode: true,
      address: true,
    },
  })

  if (user.countryCode === validatedFields.data) {
    logger.info("User's Country Code update skipped - Country code is the same.")

    return {
      errors: {
        countryCode: ["User's Country Code update skipped - Country code is the same."],
      },
    }
  }

  await prismaClient.user.update({
    where: {
      id: authUser.userId,
    },
    data: {
      countryCode: validatedFields.data,
    },
  })

  const localUser = await parseLocalUserFromCookies()

  const currentCookies = await cookies()

  currentCookies.set(
    USER_COUNTRY_CODE_COOKIE_NAME,
    JSON.stringify({ countryCode: validatedFields.data, bypassed: true }),
    {
      sameSite: 'lax',
      secure: true,
    },
  )

  waitUntil(
    getServerAnalytics({
      userId: authUser.userId,
      localUser,
    })
      .trackCountryCodeChanged({ previousCountryCode: user.countryCode })
      .flush(),
  )

  waitUntil(
    getServerPeopleAnalytics({
      userId: authUser.userId,
      localUser,
    })
      .set({
        countryCode: validatedFields.data,
      })
      .flush(),
  )

  logger.info("User's Country Code updated")

  return {
    countryCode: validatedFields.data,
  }
}
