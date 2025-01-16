import 'server-only'

import * as Sentry from '@sentry/nextjs'
import { cookies } from 'next/headers'
import { refreshJWT } from 'thirdweb/utils'

import { parseThirdwebAddress } from '@/hooks/useThirdwebAddress/parseThirdwebAddress'
import {
  THIRDWEB_TOKEN_EXPIRATION_TIME_SECONDS,
  thirdwebAdminAccount,
  thirdwebAuth,
} from '@/utils/server/thirdweb/thirdwebAuthClient'
import { THIRDWEB_AUTH_TOKEN_COOKIE_PREFIX } from '@/utils/shared/thirdwebAuthToken'
import { logger } from '@/utils/shared/logger'

export async function appRouterGetThirdwebAuthUser(): Promise<{
  userId: string
  address: string
} | null> {
  const currentCookies = await cookies()
  const token = currentCookies.get(THIRDWEB_AUTH_TOKEN_COOKIE_PREFIX)

  if (!token?.value) {
    return null
  }

  const parsedTokenBody = await getValidatedAuthTokenPayload(token.value)

  if (!parsedTokenBody) {
    return null
  }

  const { userId, address } = (parsedTokenBody?.ctx as { userId?: string; address?: string }) ?? {}

  return {
    userId: userId ?? '',
    address: parseThirdwebAddress(address ?? ''),
  }
}

async function getValidatedAuthTokenPayload(cookieToken: string) {
  const currentCookies = await cookies()
  try {
    const jwtToken = await thirdwebAuth.verifyJWT({ jwt: cookieToken })

    if (jwtToken.valid) {
      return jwtToken.parsedJWT
    }

    if (!/^this token expired at/i.test(jwtToken.error)) {
      await handleJwtValidationError({
        verificationResponse: jwtToken,
        domain: 'getValidatedAuthTokenPayload/jwtToken',
      })
      return null
    }

    const forceDisableTokenReset = currentCookies.get('SWC_DISABLE_TOKEN_REFRESH')
    if (forceDisableTokenReset?.value === 'true') {
      logger.info('JWT Refresh manually skipped')
      return null
    }

    const newJwtToken = await refreshJWT({
      account: thirdwebAdminAccount,
      jwt: cookieToken,
      expirationTime: THIRDWEB_TOKEN_EXPIRATION_TIME_SECONDS,
    })
    currentCookies.set(THIRDWEB_AUTH_TOKEN_COOKIE_PREFIX, newJwtToken)

    const refreshedJwtToken = await thirdwebAuth.verifyJWT({ jwt: newJwtToken })
    if (!refreshedJwtToken.valid) {
      await handleJwtValidationError({
        verificationResponse: refreshedJwtToken,
        domain: 'getValidatedAuthTokenPayload/refreshedJwtToken',
      })
      return null
    }

    return refreshedJwtToken.parsedJWT
  } catch (error) {
    await handleJwtValidationError({
      error,
      domain: 'getValidatedAuthTokenPayload/catch',
    })
    return null
  }
}

async function handleJwtValidationError({
  error,
  domain,
  verificationResponse,
}: {
  error?: unknown
  domain: string
  verificationResponse?: {
    valid: false
    error: string
  }
}) {
  const currentCookies = await cookies()
  currentCookies.delete(THIRDWEB_AUTH_TOKEN_COOKIE_PREFIX)
  Sentry.captureException('Invalid JWT token', {
    extra: {
      verificationResponse,
      // not capturing this because the message might include interpolated data and it would create a spam of errors
      // that would need to be manually grouped
      error,
    },
    tags: {
      domain,
    },
  })
  return null
}
