import { decodeBasicAuthHeader } from '@/utils/server/basicAuth'
import { VerifiedSWCPartner } from '@/utils/server/verifiedSWCPartner/constants'
import { requiredEnv } from '@/utils/shared/requiredEnv'
import * as Sentry from '@sentry/nextjs'
import { headers } from 'next/headers'

const VERIFIED_SWC_PARTNER_SECRET_COINBASE = requiredEnv(
  process.env.VERIFIED_SWC_PARTNER_SECRET_COINBASE,
  'process.env.VERIFIED_SWC_PARTNER_SECRET_COINBASE',
)

export const VERIFIED_SWC_PARTNER_SECRET_MAP: Record<string, VerifiedSWCPartner> = {
  [VERIFIED_SWC_PARTNER_SECRET_COINBASE]: VerifiedSWCPartner.COINBASE,
}

export const authenticateAndGetVerifiedSWCPartnerFromHeader = () => {
  const authHeader = headers().get('authorization')
  if (!authHeader) {
    throw new Error('No authorization header provided')
  }
  const result = decodeBasicAuthHeader(authHeader)
  if ('failReason' in result) {
    throw new Error(result.failReason)
  }
  const { username, password } = result
  const verifiedSWCPartner = VERIFIED_SWC_PARTNER_SECRET_MAP[password]
  if (!verifiedSWCPartner) {
    throw new Error('Invalid authorization secret')
  }
  if (verifiedSWCPartner !== username) {
    Sentry.captureMessage('invalid username within getVerifiedSWCPartnerFromHeader header', {
      extra: { username, verifiedSWCPartner },
    })
    throw new Error('Invalid authorization partner')
  }
  return verifiedSWCPartner
}
