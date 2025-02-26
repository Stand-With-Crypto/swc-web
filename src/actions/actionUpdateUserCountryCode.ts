'use server'
import 'server-only'

import * as Sentry from '@sentry/nextjs'
import { z } from 'zod'

import { appRouterGetAuthUser } from '@/utils/server/authentication/appRouterGetAuthUser'
import { prismaClient } from '@/utils/server/prismaClient'
import { throwIfRateLimited } from '@/utils/server/ratelimit/throwIfRateLimited'
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
    const error = new Error('Update User Country Code - Not authenticated')

    Sentry.captureException(error, {
      tags: { domain: 'actionUpdateUserCountryCode' },
      extra: {
        sessionId,
      },
    })

    throw error
  }

  const validatedFields = zodSupportedCountryCode.safeParse(countryCode)
  if (!validatedFields.success) {
    const error = new Error('Update User Country Code - Invalid country code')

    logger.error('Update User Country Code - Invalid country code', {
      countryCode,
    })

    Sentry.captureException(error, {
      tags: { domain: 'actionUpdateUserCountryCode' },
      extra: {
        sessionId,
        countryCode,
      },
    })

    return {
      errors: {
        countryCode: [`Country code ${countryCode.toUpperCase()} is not supported`],
      },
    }
  }

  await throwIfRateLimited({ context: 'authenticated' })

  const user = await prismaClient.user.findFirstOrThrow({
    where: {
      id: authUser.userId,
    },
  })

  if (user.countryCode === validatedFields.data) {
    logger.info('Update User Country Code - Country code is the same. Skipping update.')

    return {
      errors: {
        countryCode: ['New country code is the same as the current country code'],
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

  logger.info('Update User Country Code - Country code updated', {
    countryCode: validatedFields.data,
  })

  return {
    countryCode: validatedFields.data,
  }
}
