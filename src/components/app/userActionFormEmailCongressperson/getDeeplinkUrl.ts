import { slugify } from '@/utils/shared/slugify'
import { DEFAULT_SUPPORTED_COUNTRY_CODE } from '@/utils/shared/supportedCountries'
import { getIntlPrefix } from '@/utils/shared/urls'
import { USUserActionEmailCampaignName } from '@/utils/shared/userActionCampaigns/us/usUserActionCampaigns'

export function getDeeplinkUrlByCampaignName(campaignName: USUserActionEmailCampaignName) {
  const slugifiedCampaignName =
    campaignName === USUserActionEmailCampaignName.DEFAULT
      ? 'default'
      : (slugify(campaignName) ?? '')

  return `${getIntlPrefix(DEFAULT_SUPPORTED_COUNTRY_CODE)}/action/email/${slugifiedCampaignName}`
}
