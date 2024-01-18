import { requiredEnv } from '@/utils/shared/requiredEnv'

export enum VerifiedSWCPartner {
  COINBASE = 'coinbase',
}

const VERIFIED_SWC_PARTNER_SECRET_COINBASE = requiredEnv(
  process.env.VERIFIED_SWC_PARTNER_SECRET_COINBASE,
  'process.env.VERIFIED_SWC_PARTNER_SECRET_COINBASE',
)

export const VERIFIED_SWC_PARTNER_SECRET_MAP: Record<VerifiedSWCPartner, string> = {
  [VerifiedSWCPartner.COINBASE]: VERIFIED_SWC_PARTNER_SECRET_COINBASE,
}
