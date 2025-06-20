import { slugify } from '@/utils/shared/slugify'

export function deSlugifyCampaignName<CampaignName extends object>(
  slugifiedCampaignName: string,
  campaignNameEnum: CampaignName,
): CampaignName[keyof CampaignName] | undefined {
  if (slugifiedCampaignName === 'default' && 'DEFAULT' in campaignNameEnum) {
    return campaignNameEnum.DEFAULT as CampaignName[keyof CampaignName]
  }

  return Object.values(campaignNameEnum).find(
    campaignName => slugify(campaignName) === slugifiedCampaignName,
  )
}
