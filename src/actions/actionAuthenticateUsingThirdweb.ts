'use server'

// WIP: This file is not yet complete. It is a work in progress.

import { cookies } from 'next/headers'
import { createAuth, VerifyLoginPayloadParams } from 'thirdweb/auth'
import { privateKeyToAccount } from 'thirdweb/wallets'

import { requiredEnv } from '@/utils/shared/requiredEnv'
import { thirdwebClient } from '@/utils/shared/thirdwebClient'

const THIRDWEB_AUTH_PRIVATE_KEY = requiredEnv(
  process.env.THIRDWEB_AUTH_PRIVATE_KEY,
  'THIRDWEB_AUTH_PRIVATE_KEY',
)

export const NEXT_PUBLIC_THIRDWEB_AUTH_DOMAIN = requiredEnv(
  process.env.NEXT_PUBLIC_THIRDWEB_AUTH_DOMAIN,
  'process.env.NEXT_PUBLIC_THIRDWEB_AUTH_DOMAIN',
)

const THIRDWEB_AUTH_COOKIE_PREFIX = `thirdweb_auth`
export const THIRDWEB_AUTH_TOKEN_COOKIE_PREFIX = `${THIRDWEB_AUTH_COOKIE_PREFIX}_token`

const thirdwebAuth = createAuth({
  domain: NEXT_PUBLIC_THIRDWEB_AUTH_DOMAIN,
  adminAccount: privateKeyToAccount({
    client: thirdwebClient,
    privateKey: THIRDWEB_AUTH_PRIVATE_KEY,
  }),
  client: thirdwebClient,
  jwt: {
    expirationTimeSeconds: 60 * 60 * 24 * 7, // 1 week
  },
})

export const generatePayload = thirdwebAuth.generatePayload

export async function login(payload: VerifyLoginPayloadParams) {
  const verifiedPayload = await thirdwebAuth.verifyPayload(payload)
  if (verifiedPayload.valid) {
    const jwt = await thirdwebAuth.generateJWT({
      payload: verifiedPayload.payload,
    })

    // const jwt = await thirdwebAuth.generateJWT({
    //   payload: verifiedPayload.payload,
    //   context: {
    //     admin: true, add custom properties here
    //   },
    // });
    cookies().set(THIRDWEB_AUTH_TOKEN_COOKIE_PREFIX, jwt)
  }
}

export async function isLoggedIn() {
  const jwt = cookies().get(THIRDWEB_AUTH_TOKEN_COOKIE_PREFIX)
  if (!jwt?.value) {
    return false
  }

  const authResult = await thirdwebAuth.verifyJWT({ jwt: jwt.value })
  if (!authResult.valid) {
    return false
  }
  return true
}

export async function logout() {
  cookies().delete(THIRDWEB_AUTH_TOKEN_COOKIE_PREFIX)
}
