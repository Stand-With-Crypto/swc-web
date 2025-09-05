import { US_SIMPLE_PAGE_CAMPAIGN_CTAS } from '@/components/app/pageSimpleActions/ctas/us'
import { SimpleActionsGroupName } from '@/components/app/pageSimpleActions/types'
import { UserActionGridCTA } from '@/components/app/userActionGridCTAs/types'
import { gracefullyError } from '@/utils/shared/gracefullyError'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'

const CAMPAIGNS_BY_COUNTRY_CODE_MAP: Partial<
  Record<SupportedCountryCodes, Record<SimpleActionsGroupName, UserActionGridCTA>>
> = {
  [SupportedCountryCodes.US]: US_SIMPLE_PAGE_CAMPAIGN_CTAS,
}

export function getUserActionsCTAs({
  countryCode,
  actionsGroupName,
}: {
  countryCode: SupportedCountryCodes
  actionsGroupName: SimpleActionsGroupName
}) {
  const actionsCTAs = CAMPAIGNS_BY_COUNTRY_CODE_MAP[countryCode]?.[actionsGroupName]

  if (!actionsCTAs) {
    return gracefullyError({
      msg: `Campaign config not found for ${countryCode}`,
      fallback: null,
      hint: {
        level: 'error',
        tags: {
          domain: 'simplePageCampaignCTAs',
        },
        extra: {
          actionsGroupName,
          countryCode,
        },
      },
    })
  }

  return actionsCTAs
}
