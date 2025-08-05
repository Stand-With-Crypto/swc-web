import { US_SIMPLE_PAGE_CAMPAIGN_CTAS } from '@/components/app/pageSimpleCampaign/ctas/us'
import { SimpleCampaignName } from '@/components/app/pageSimpleCampaign/types'
import { UserActionGridCTA } from '@/components/app/userActionGridCTAs/types'
import { gracefullyError } from '@/utils/shared/gracefullyError'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'

const CAMPAIGNS_BY_COUNTRY_CODE_MAP: Partial<
  Record<SupportedCountryCodes, Record<SimpleCampaignName, UserActionGridCTA>>
> = {
  [SupportedCountryCodes.US]: US_SIMPLE_PAGE_CAMPAIGN_CTAS,
}

export function getCampaignUserActionCTAs({
  countryCode,
  campaign,
}: {
  countryCode: SupportedCountryCodes
  campaign: SimpleCampaignName
}) {
  const campaignCTAs = CAMPAIGNS_BY_COUNTRY_CODE_MAP[countryCode]?.[campaign]

  if (!campaignCTAs) {
    return gracefullyError({
      msg: `Campaign config not found for ${countryCode}`,
      fallback: null,
      hint: {
        level: 'error',
        tags: {
          domain: 'simplePageCampaignCTAs',
        },
        extra: {
          campaign,
          countryCode,
        },
      },
    })
  }

  return campaignCTAs
}
