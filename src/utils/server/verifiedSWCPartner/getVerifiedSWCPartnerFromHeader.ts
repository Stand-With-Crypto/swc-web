import { decodeBasicAuthHeader } from '@/utils/server/basicAuth'
import { VERIFIED_SWC_PARTNER_SECRET_MAP } from '@/utils/server/verifiedSWCPartner/constants'
import * as Sentry from '@sentry/nextjs'
import { headers } from 'next/headers'

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
