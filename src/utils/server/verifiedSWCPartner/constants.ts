import { requiredEnv } from '@/utils/shared/requiredEnv'

export enum VerifiedSWCPartner {
  COINBASE = 'coinbase',
}

export interface VerifiedSWCPartnerApiResponse<ResultOptions extends string> {
  result: ResultOptions | null
  resultOptions: ResultOptions[] | []
  sessionId: string
  userId: string
}

const VERIFIED_SWC_PARTNER_SECRET_COINBASE = requiredEnv(
  process.env.VERIFIED_SWC_PARTNER_SECRET_COINBASE,
  'process.env.VERIFIED_SWC_PARTNER_SECRET_COINBASE',
)

export const VERIFIED_SWC_PARTNER_SECRET_MAP: Record<VerifiedSWCPartner, string> = {
  [VerifiedSWCPartner.COINBASE]: VERIFIED_SWC_PARTNER_SECRET_COINBASE,
}
