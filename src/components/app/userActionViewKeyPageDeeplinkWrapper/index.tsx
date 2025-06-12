import { SearchParams } from 'next/dist/server/request/search-params'
import { notFound } from 'next/navigation'

import {
  CampaignMetadata,
  UserActionViewKeyPageDeeplinkLoading,
} from '@/components/app/userActionViewKeyPageDeeplinkWrapper/loading'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'

export type dynamic = 'error'

export type CampaignMetadataMap<K extends Uppercase<string>> = Partial<Record<K, CampaignMetadata>>

interface UserActionViewKeyPageDeeplinkWrapperProps<K extends Uppercase<string>> {
  campaignMetadataMap: CampaignMetadataMap<K>
  countryCode: SupportedCountryCodes
  minWaitTimeInSeconds?: number
  pathName: string
  searchParams: SearchParams | undefined
}

export async function UserActionViewKeyPageDeeplinkWrapper<K extends Uppercase<string>>({
  campaignMetadataMap,
  countryCode,
  minWaitTimeInSeconds,
  pathName,
  searchParams,
}: UserActionViewKeyPageDeeplinkWrapperProps<K>) {
  const campaignName = (searchParams?.campaignName || null) as K | null

  const campaignMetadata = campaignName ? campaignMetadataMap[campaignName] : null

  if (!campaignName || !campaignMetadata) {
    notFound()
  }

  return (
    <UserActionViewKeyPageDeeplinkLoading
      campaignMetadata={campaignMetadata}
      campaignName={campaignName}
      countryCode={countryCode}
      minWaitTimeInSeconds={minWaitTimeInSeconds}
      pathName={pathName}
    />
  )
}
