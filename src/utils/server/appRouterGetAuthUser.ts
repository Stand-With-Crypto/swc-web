import 'server-only'
import { ThirdwebAuth, ThirdwebAuthUser } from '@thirdweb-dev/auth/next'
import { ThirdwebAuth as ThirdwebAuthSDK } from '@thirdweb-dev/auth'
import { NextRequest } from 'next/server'
import { thirdWebAuthConfig } from '@/utils/server/thirdWebAuth'
import { cookies } from 'next/headers'
/*
 Below is a version of getUser from Thirdweb, modified to support the app router.
 We should delete this code once they formally support the NextRequest object with their SDK, 
 which will be "soon" https://github.com/thirdweb-dev/js/issues/2022#issuecomment-1854071399
*/

const THIRDWEB_AUTH_COOKIE_PREFIX = `thirdweb_auth`
export const THIRDWEB_AUTH_TOKEN_COOKIE_PREFIX = `${THIRDWEB_AUTH_COOKIE_PREFIX}_token`
export const THIRDWEB_AUTH_ACTIVE_ACCOUNT_COOKIE = `${THIRDWEB_AUTH_COOKIE_PREFIX}_active_account`
const thirdWebAuthContext = {
  ...thirdWebAuthConfig,
  auth: new ThirdwebAuthSDK(thirdWebAuthConfig.wallet, thirdWebAuthConfig.domain),
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
    authUser = await thirdWebAuthContext.auth.authenticate(token, {
      validateTokenId: async (tokenId: string) => {
        if (thirdWebAuthContext.authOptions?.validateTokenId) {
          await thirdWebAuthContext.authOptions?.validateTokenId(tokenId)
        }
      },
    })
  } catch (err) {
    return null
  }
  console.log('authUser finished', authUser)

  /*
  Normally thirdWebAuthContext.callbacks.onUser(authUser) would be called here, but the type signature expects
  a request object which we don't have in the app router. So we run the logic we want to run "onUser" directly here instead
  */
  // TODO analytics
  // TODO add additional metdata to the jwt we need
  return authUser
}
