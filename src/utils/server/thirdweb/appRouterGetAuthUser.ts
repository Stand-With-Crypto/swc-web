import 'server-only'
import { ThirdwebAuth, ThirdwebAuthUser } from '@thirdweb-dev/auth/next'
import { ThirdwebAuth as ThirdwebAuthSDK } from '@thirdweb-dev/auth'
import { NextRequest } from 'next/server'
import { thirdwebAuthConfig } from '@/utils/server/thirdweb/thirdwebAuthConfig'
import { cookies } from 'next/headers'
/*
 Below is a version of getUser from Thirdweb, modified to support the app router.
 We should delete this code once they formally support the NextRequest object with their SDK, 
 which will be "soon" https://github.com/thirdweb-dev/js/issues/2022#issuecomment-1854071399
*/

const THIRDWEB_AUTH_COOKIE_PREFIX = `thirdweb_auth`
export const THIRDWEB_AUTH_TOKEN_COOKIE_PREFIX = `${THIRDWEB_AUTH_COOKIE_PREFIX}_token`
export const THIRDWEB_AUTH_ACTIVE_ACCOUNT_COOKIE = `${THIRDWEB_AUTH_COOKIE_PREFIX}_active_account`
const thirdwebAuthContext = {
  ...thirdwebAuthConfig,
  auth: new ThirdwebAuthSDK(thirdwebAuthConfig.wallet, thirdwebAuthConfig.domain),
}

export function getCookie(cookie: string): string | undefined {
  return cookies().get(cookie)?.value
}

export function getActiveCookie(): string | undefined {
  const activeAccount = getCookie(THIRDWEB_AUTH_ACTIVE_ACCOUNT_COOKIE)
  if (activeAccount) {
    return `${THIRDWEB_AUTH_TOKEN_COOKIE_PREFIX}_${activeAccount}`
  }
}

export function getToken(): string | undefined {
  const activeCookie = getActiveCookie()
  if (!activeCookie) {
    return undefined
  }

  return getCookie(activeCookie)
}

export async function appRouterGetAuthUser(): Promise<ThirdwebAuthUser | null> {
  const token = getToken()
  if (!token) {
    return null
  }

  let authUser: ThirdwebAuthUser
  try {
    authUser = await thirdwebAuthContext.auth.authenticate(token, {
      validateTokenId: async (tokenId: string) => {
        if (thirdwebAuthContext.authOptions?.validateTokenId) {
          await thirdwebAuthContext.authOptions?.validateTokenId(tokenId)
        }
      },
    })
  } catch (err) {
    return null
  }
  /*
  Normally thirdwebAuthContext.callbacks.onUser(authUser) would be called here, but the type signature expects
  a request object which we don't have in the app router. So we run the logic we want to run "onUser" directly here instead
  */
  // TODO analytics
  // TODO add additional metdata to the jwt we need
  return authUser
}
