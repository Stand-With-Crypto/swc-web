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
  const jwtToken = await thirdwebAuth.verifyJWT({ jwt: cookieToken })

  if (jwtToken.valid) {
    return jwtToken.parsedJWT
  }

  if (!/^this token expired at/i.test(jwtToken.error)) {
    await handleJwtValidationError(jwtToken, { domain: 'getValidatedAuthTokenPayload/jwtToken' })
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
    await handleJwtValidationError(refreshedJwtToken, {
      domain: 'getValidatedAuthTokenPayload/refreshedJwtToken',
    })
    return null
  }

  return refreshedJwtToken.parsedJWT
}

async function handleJwtValidationError(
  verificationResponse: {
    valid: false
    error: string
  },
  { domain }: { domain: string },
) {
  const currentCookies = await cookies()
  currentCookies.delete(THIRDWEB_AUTH_TOKEN_COOKIE_PREFIX)
  Sentry.captureException('Invalid JWT token', {
    extra: verificationResponse,
    tags: {
      domain,
    },
  })
  return null
}
