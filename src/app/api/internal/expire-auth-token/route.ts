import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { refreshJWT } from 'thirdweb/utils'

import { thirdwebAdminAccount } from '@/utils/server/thirdweb/thirdwebAuthClient'
import { THIRDWEB_AUTH_TOKEN_COOKIE_PREFIX } from '@/utils/shared/thirdwebAuthToken'

export async function POST() {
  const currentCookies = await cookies()

  const currentToken = currentCookies.get(THIRDWEB_AUTH_TOKEN_COOKIE_PREFIX)
  if (!currentToken?.value) {
    return NextResponse.error()
  }

  const newJwtToken = await refreshJWT({
    account: thirdwebAdminAccount,
    jwt: currentToken.value,
    expirationTime: 1,
  })
  currentCookies.set(THIRDWEB_AUTH_TOKEN_COOKIE_PREFIX, newJwtToken)
  return NextResponse.json({
    ok: true,
  })
}
