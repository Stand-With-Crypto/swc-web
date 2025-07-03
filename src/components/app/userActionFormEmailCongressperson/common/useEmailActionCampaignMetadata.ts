import { useMemo } from 'react'

import { getAUEmailActionCampaignMetadata } from '@/components/app/userActionFormEmailCongressperson/au/campaigns'
import { CampaignMetadata as AUCampaignMetadata } from '@/components/app/userActionFormEmailCongressperson/au/campaigns/types'
import { getCAEmailActionCampaignMetadata } from '@/components/app/userActionFormEmailCongressperson/ca/campaigns'
import { CampaignMetadata as CACampaignMetadata } from '@/components/app/userActionFormEmailCongressperson/ca/campaigns/types'
import { EmailActionCampaignNames } from '@/components/app/userActionFormEmailCongressperson/common/types'
import { getGBEmailActionCampaignMetadata } from '@/components/app/userActionFormEmailCongressperson/gb/campaigns'
import { CampaignMetadata as GBCampaignMetadata } from '@/components/app/userActionFormEmailCongressperson/gb/campaigns/types'
import { getUSEmailActionCampaignMetadata } from '@/components/app/userActionFormEmailCongressperson/us/campaigns'
import { CampaignMetadata as USCampaignMetadata } from '@/components/app/userActionFormEmailCongressperson/us/campaigns/types'
import { gracefullyError } from '@/utils/shared/gracefullyError'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { AUUserActionEmailCampaignName } from '@/utils/shared/userActionCampaigns/au/auUserActionCampaigns'
import { CAUserActionEmailCampaignName } from '@/utils/shared/userActionCampaigns/ca/caUserActionCampaigns'
import { GBUserActionEmailCampaignName } from '@/utils/shared/userActionCampaigns/gb/gbUserActionCampaigns'
import { USUserActionEmailCampaignName } from '@/utils/shared/userActionCampaigns/us/usUserActionCampaigns'

interface UseEmailActionCampaignMetadataProps<TCountryCode extends SupportedCountryCodes> {
  countryCode: TCountryCode
  campaignName: EmailActionCampaignNames
}

interface CampaignMetadataMap {
  [SupportedCountryCodes.US]: USCampaignMetadata
  [SupportedCountryCodes.AU]: AUCampaignMetadata
  [SupportedCountryCodes.CA]: CACampaignMetadata
  [SupportedCountryCodes.GB]: GBCampaignMetadata
}
type CampaignMetadata<TCountryCode extends SupportedCountryCodes> =
  CampaignMetadataMap[TCountryCode]

export function useEmailActionCampaignMetadata<TCountryCode extends SupportedCountryCodes>(
  props: UseEmailActionCampaignMetadataProps<TCountryCode>,
): CampaignMetadata<TCountryCode> {
  const { campaignName, countryCode } = props
  return useMemo(() => {
    switch (countryCode) {
      case SupportedCountryCodes.US:
        return getUSEmailActionCampaignMetadata(campaignName as USUserActionEmailCampaignName)
      case SupportedCountryCodes.AU:
        return getAUEmailActionCampaignMetadata(campaignName as AUUserActionEmailCampaignName)
      case SupportedCountryCodes.CA:
        return getCAEmailActionCampaignMetadata(campaignName as CAUserActionEmailCampaignName)
      case SupportedCountryCodes.GB:
        return getGBEmailActionCampaignMetadata(campaignName as GBUserActionEmailCampaignName)
      default:
        return gracefullyError({
          msg: `useEmailActionCampaignMetadata received invalid country code`,
          fallback: null,
          hint: {
            tags: {
              domain: 'useEmailActionCampaignMetadata',
            },
            extra: {
              campaignName,
              countryCode,
            },
          },
        })
    }
  }, [campaignName, countryCode]) as CampaignMetadata<TCountryCode>
}
