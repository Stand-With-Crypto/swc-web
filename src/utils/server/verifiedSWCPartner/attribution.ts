import { VerifiedSWCPartner } from '@/utils/server/verifiedSWCPartner/constants'
import { User } from '@prisma/client'

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
    acquisitionCampaign: campaignName,
    acquisitionMedium: 'verified-swc-partner-api',
    acquisitionReferer: '',
    acquisitionSource: partner,
  }
}
