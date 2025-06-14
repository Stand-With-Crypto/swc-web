import { useMemo } from 'react'

import { getAUEmailActionCampaignMetadata } from '@/components/app/userActionFormEmailCongressperson/au/campaigns'
import { getCAEmailActionCampaignMetadata } from '@/components/app/userActionFormEmailCongressperson/ca/campaigns'
import { getGBEmailActionCampaignMetadata } from '@/components/app/userActionFormEmailCongressperson/gb/campaigns'
import { getUSEmailActionCampaignMetadata } from '@/components/app/userActionFormEmailCongressperson/us/campaigns'
import { gracefullyError } from '@/utils/shared/gracefullyError'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { AUUserActionEmailCampaignName } from '@/utils/shared/userActionCampaigns/au/auUserActionCampaigns'
import { CAUserActionEmailCampaignName } from '@/utils/shared/userActionCampaigns/ca/caUserActionCampaigns'
import { GBUserActionEmailCampaignName } from '@/utils/shared/userActionCampaigns/gb/gbUserActionCampaigns'
import { USUserActionEmailCampaignName } from '@/utils/shared/userActionCampaigns/us/usUserActionCampaigns'

export type UseEmailActionCampaignMetadataProps =
  | {
      countryCode: SupportedCountryCodes.US
      campaignName: USUserActionEmailCampaignName
    }
  | {
      countryCode: SupportedCountryCodes.AU
      campaignName: AUUserActionEmailCampaignName
    }
  | {
      countryCode: SupportedCountryCodes.CA
      campaignName: CAUserActionEmailCampaignName
    }
  | {
      countryCode: SupportedCountryCodes.GB
      campaignName: GBUserActionEmailCampaignName
    }

export function useEmailActionCampaignMetadata(props: UseEmailActionCampaignMetadataProps) {
  const { campaignName, countryCode } = props
  return useMemo(() => {
    switch (countryCode) {
      case SupportedCountryCodes.US:
        return getUSEmailActionCampaignMetadata(campaignName)
      case SupportedCountryCodes.AU:
        return getAUEmailActionCampaignMetadata(campaignName)
      case SupportedCountryCodes.CA:
        return getCAEmailActionCampaignMetadata(campaignName)
      case SupportedCountryCodes.GB:
        return getGBEmailActionCampaignMetadata(campaignName)
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
  }, [campaignName, countryCode])
}
