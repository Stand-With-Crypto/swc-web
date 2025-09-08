import { SearchParams } from 'next/dist/server/request/search-params'

import {
  CampaignMetadataMap,
  UserActionViewKeyPageDeeplinkWrapper,
} from '@/components/app/userActionViewKeyPageDeeplinkWrapper'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { GBUserActionViewKeyPageCampaignName } from '@/utils/shared/userActionCampaigns/gb/gbUserActionCampaigns'

const countryCode = SupportedCountryCodes.GB

const campaignMetadataMap: CampaignMetadataMap<GBUserActionViewKeyPageCampaignName> = {
  [GBUserActionViewKeyPageCampaignName.UK_STABLE_COINS_PETITION_JUN_2025]: {
    url: 'https://petition.parliament.uk/petitions/730568',
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
      searchParams={searchParams}
    />
  )
}
