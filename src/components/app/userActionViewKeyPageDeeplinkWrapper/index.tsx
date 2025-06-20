import { SearchParams } from 'next/dist/server/request/search-params'
import { notFound } from 'next/navigation'

import {
  CampaignMetadata,
  UserActionViewKeyPageDeeplinkRedirect,
} from '@/components/app/userActionViewKeyPageDeeplinkWrapper/redirect'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'

export type dynamic = 'error'

export type CampaignMetadataMap<K extends string> = Partial<Record<K, CampaignMetadata>>

interface UserActionViewKeyPageDeeplinkWrapperProps<K extends string> {
  campaignMetadataMap: CampaignMetadataMap<K>
  countryCode: SupportedCountryCodes
  minWaitTimeInSeconds?: number
  searchParams: SearchParams | undefined
}

export async function UserActionViewKeyPageDeeplinkWrapper<K extends string>({
  campaignMetadataMap,
  countryCode,
  minWaitTimeInSeconds,
  searchParams,
}: UserActionViewKeyPageDeeplinkWrapperProps<K>) {
  const campaignName = (searchParams?.campaignName || null) as K | null

  const campaignMetadata = campaignName ? campaignMetadataMap[campaignName] : null

  if (!campaignName || !campaignMetadata) {
    notFound()
  }

  return (
    <UserActionViewKeyPageDeeplinkRedirect
      campaignMetadata={campaignMetadata}
      campaignName={campaignName}
      countryCode={countryCode}
      minWaitTimeInSeconds={minWaitTimeInSeconds}
    />
  )
}
