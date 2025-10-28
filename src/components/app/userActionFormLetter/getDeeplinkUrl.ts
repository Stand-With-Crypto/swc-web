import { slugify } from '@/utils/shared/slugify'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { getIntlPrefix } from '@/utils/shared/urls'
import { AUUserActionLetterCampaignName } from '@/utils/shared/userActionCampaigns/au/auUserActionCampaigns'

interface Args {
  countryCode: SupportedCountryCodes
  campaignName: AUUserActionLetterCampaignName
}

const getDefaultCampaignName = (countryCode: SupportedCountryCodes) => {
  switch (countryCode) {
    case SupportedCountryCodes.AU:
      return AUUserActionLetterCampaignName.DEFAULT
    default:
      return AUUserActionLetterCampaignName.DEFAULT
  }
}

export function getDeeplinkUrlByCampaignName({ campaignName, countryCode }: Args) {
  const slugifiedCampaignName =
    campaignName === getDefaultCampaignName(countryCode) ? 'default' : (slugify(campaignName) ?? '')

  return `${getIntlPrefix(countryCode)}/action/letter/${slugifiedCampaignName}`
}
