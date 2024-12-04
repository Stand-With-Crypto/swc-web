import * as Sentry from '@sentry/nextjs'
import crypto from 'crypto'
import { headers } from 'next/headers'

import { decodeBasicAuthHeader } from '@/utils/server/basicAuth'
import {
  VERIFIED_SWC_PARTNER_SECRET_MAP,
  VerifiedSWCPartner,
} from '@/utils/server/verifiedSWCPartner/constants'

// Why not just use ===? See https://stackoverflow.com/a/31096242
const areEqual = (a: string, b: string) => {
  try {
    return crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b))
  } catch (e) {
    return false
  }
}

export const authenticateAndGetVerifiedSWCPartnerFromHeader = async () => {
  const currentHeaders = await headers()
  const authHeader = currentHeaders.get('authorization')
  if (!authHeader) {
    throw new Error('No authorization header provided')
  }
  const result = decodeBasicAuthHeader(authHeader)
  if ('failReason' in result) {
    throw new Error(result.failReason)
  }
  const { username, password } = result
  const partner = username as VerifiedSWCPartner
  const partnerSecret = VERIFIED_SWC_PARTNER_SECRET_MAP[partner]
  if (!partnerSecret) {
    Sentry.captureMessage('invalid username within getVerifiedSWCPartnerFromHeader header', {
      extra: { partner },
    })
    throw new Error('Invalid authorization')
  }
  if (!areEqual(password, partnerSecret)) {
    Sentry.captureMessage('invalid password within getVerifiedSWCPartnerFromHeader header', {
      extra: { partner },
    })
    throw new Error('Invalid authorization')
  }

  return partner
}
