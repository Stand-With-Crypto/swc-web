import { useMemo } from 'react'

import { getAUEmailActionCampaignMetadata } from '@/components/app/userActionFormEmailCongressperson/au/campaigns'
import { getCAEmailActionCampaignMetadata } from '@/components/app/userActionFormEmailCongressperson/ca/campaigns'
import { EmailActionCampaignNames } from '@/components/app/userActionFormEmailCongressperson/common/types'
import { getGBEmailActionCampaignMetadata } from '@/components/app/userActionFormEmailCongressperson/gb/campaigns'
import { getUSEmailActionCampaignMetadata } from '@/components/app/userActionFormEmailCongressperson/us/campaigns'
import { gracefullyError } from '@/utils/shared/gracefullyError'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { AUUserActionEmailCampaignName } from '@/utils/shared/userActionCampaigns/au/auUserActionCampaigns'
import { CAUserActionEmailCampaignName } from '@/utils/shared/userActionCampaigns/ca/caUserActionCampaigns'
import { GBUserActionEmailCampaignName } from '@/utils/shared/userActionCampaigns/gb/gbUserActionCampaigns'
import { USUserActionEmailCampaignName } from '@/utils/shared/userActionCampaigns/us/usUserActionCampaigns'

interface UseEmailActionCampaignMetadataProps {
  countryCode: SupportedCountryCodes
  campaignName: EmailActionCampaignNames
}

export function useEmailActionCampaignMetadata(props: UseEmailActionCampaignMetadataProps) {
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
  }, [campaignName, countryCode])
}
