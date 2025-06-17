'use client'

import { Suspense, useMemo } from 'react'

import { UserActionFormEmailCongresspersonSkeleton } from '@/components/app/userActionFormEmailCongressperson/common/skeleton'
import { UserActionFormEmailCongresspersonProps } from '@/components/app/userActionFormEmailCongressperson/common/types'
import {
  LazyAUUserActionFormEmailCongressperson,
  LazyCAUserActionFormEmailCongressperson,
  LazyGBUserActionFormEmailCongressperson,
  LazyUSUserActionFormEmailCongressperson,
} from '@/components/app/userActionFormEmailCongressperson/lazyLoad'
import { gracefullyError } from '@/utils/shared/gracefullyError'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { AUUserActionEmailCampaignName } from '@/utils/shared/userActionCampaigns/au/auUserActionCampaigns'
import { CAUserActionEmailCampaignName } from '@/utils/shared/userActionCampaigns/ca/caUserActionCampaigns'
import { GBUserActionEmailCampaignName } from '@/utils/shared/userActionCampaigns/gb/gbUserActionCampaigns'
import { USUserActionEmailCampaignName } from '@/utils/shared/userActionCampaigns/us/usUserActionCampaigns'

export function UserActionFormEmailCongressperson(props: UserActionFormEmailCongresspersonProps) {
  const { countryCode } = props

  const LazyUserActionFormEmailCongressperson = useMemo(() => {
    switch (countryCode) {
      case SupportedCountryCodes.US:
        return (
          <LazyUSUserActionFormEmailCongressperson
            {...props}
            campaignName={props.campaignName as USUserActionEmailCampaignName}
          />
        )
      case SupportedCountryCodes.AU:
        return (
          <LazyAUUserActionFormEmailCongressperson
            {...props}
            campaignName={props.campaignName as AUUserActionEmailCampaignName}
          />
        )
      case SupportedCountryCodes.CA:
        return (
          <LazyCAUserActionFormEmailCongressperson
            {...props}
            campaignName={props.campaignName as CAUserActionEmailCampaignName}
          />
        )
      case SupportedCountryCodes.GB:
        return (
          <LazyGBUserActionFormEmailCongressperson
            {...props}
            campaignName={props.campaignName as GBUserActionEmailCampaignName}
          />
        )
      default:
        return gracefullyError({
          msg: `Country implementation not found for UserActionFormEmailCongressperson`,
          fallback: null,
          hint: {
            level: 'error',
            tags: {
              domain: 'UserActionFormEmailCongressperson',
            },
            extra: {
              countryCode,
            },
          },
        })
    }
  }, [countryCode, props])

  return (
    <Suspense fallback={<UserActionFormEmailCongresspersonSkeleton {...props} />}>
      {LazyUserActionFormEmailCongressperson}
    </Suspense>
  )
}
