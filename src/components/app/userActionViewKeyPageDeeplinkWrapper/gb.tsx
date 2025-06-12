import { SearchParams } from 'next/dist/server/request/search-params'

import {
  CampaignMetadataMap,
  UserActionViewKeyPageDeeplinkWrapper,
} from '@/components/app/userActionViewKeyPageDeeplinkWrapper'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { GBUserActionViewKeyPageCampaignName } from '@/utils/shared/userActionCampaigns/gb/gbUserActionCampaigns'

const countryCode = SupportedCountryCodes.GB

const campaignMetadataMap: CampaignMetadataMap<keyof typeof GBUserActionViewKeyPageCampaignName> = {
  NEWMODE_EMAIL_ACTION: {
    url: 'https://www.google.com/',
  },
}

export function GbUserActionViewKeyPageDeeplinkWrapper({
  searchParams,
}: {
  searchParams: SearchParams | undefined
}) {
  return (
    <UserActionViewKeyPageDeeplinkWrapper
      campaignMetadataMap={campaignMetadataMap}
      countryCode={countryCode}
      pathName="/gb/action/view-key-page"
      searchParams={searchParams}
    />
  )
}
