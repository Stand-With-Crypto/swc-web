import { UserActionType } from '@prisma/client'

import { getUserActionCTAsByCountry } from '@/components/app/userActionGridCTAs/constants/ctas'
import { PageProps } from '@/types'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'

interface ValidatePagePropsProps extends PageProps<{ action: UserActionType }> {
  countryCode: SupportedCountryCodes
}

export async function validatePageProps({ countryCode, params }: ValidatePagePropsProps) {
  const { action } = await params
  const parsedAction = action?.toUpperCase()
  const cta = getUserActionCTAsByCountry(countryCode)[parsedAction]

  const hasActiveCampaigns = cta?.campaigns?.some(campaign => campaign.isCampaignActive)

  return {
    cta,
    isNotFound: !action || !cta || !hasActiveCampaigns,
  }
}
