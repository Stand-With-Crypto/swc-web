import { slugify } from '@/utils/shared/slugify'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { getIntlPrefix } from '@/utils/shared/urls'
import { AUUserActionEmailCampaignName } from '@/utils/shared/userActionCampaigns/au/auUserActionCampaigns'
import { CAUserActionEmailCampaignName } from '@/utils/shared/userActionCampaigns/ca/caUserActionCampaigns'
import { GBUserActionEmailCampaignName } from '@/utils/shared/userActionCampaigns/gb/gbUserActionCampaigns'
import { USUserActionEmailCampaignName } from '@/utils/shared/userActionCampaigns/us/usUserActionCampaigns'

interface Args {
  countryCode: SupportedCountryCodes
  campaignName:
    | USUserActionEmailCampaignName
    | GBUserActionEmailCampaignName
    | CAUserActionEmailCampaignName
    | AUUserActionEmailCampaignName
}

const getDefaultCampaignName = (countryCode: SupportedCountryCodes) => {
  switch (countryCode) {
    case SupportedCountryCodes.US:
      return USUserActionEmailCampaignName.DEFAULT
    case SupportedCountryCodes.GB:
      return GBUserActionEmailCampaignName.DEFAULT
    case SupportedCountryCodes.CA:
      return CAUserActionEmailCampaignName.DEFAULT
    case SupportedCountryCodes.AU:
      return AUUserActionEmailCampaignName.DEFAULT
  }
}
export function getDeeplinkUrlByCampaignName({ campaignName, countryCode }: Args) {
  const slugifiedCampaignName =
    campaignName === getDefaultCampaignName(countryCode) ? 'default' : (slugify(campaignName) ?? '')

  return `${getIntlPrefix(countryCode)}/action/email/${slugifiedCampaignName}`
}
