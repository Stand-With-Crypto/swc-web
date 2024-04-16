import { User } from '@prisma/client'

import { VerifiedSWCPartner } from '@/utils/server/verifiedSWCPartner/constants'

export function getUserAttributionFieldsForVerifiedSWCPartner({
  partner,
  campaignName,
}: {
  partner: VerifiedSWCPartner
  campaignName: string
}): Pick<
  User,
  'acquisitionReferer' | 'acquisitionSource' | 'acquisitionMedium' | 'acquisitionCampaign'
> {
  return {
    acquisitionReferer: '',
    acquisitionSource: partner,
    acquisitionMedium: 'verified-swc-partner-api',
    acquisitionCampaign: campaignName,
  }
}
