'use client'

import dynamic from 'next/dynamic'

import { UserActionFormActionUnavailable } from '@/components/app/userActionFormCommon/actionUnavailable'
import { UserActionFormEmailCongresspersonSkeleton } from '@/components/app/userActionFormEmailCongressperson/common/skeleton'
import { UserActionFormEmailCongresspersonProps } from '@/components/app/userActionFormEmailCongressperson/common/types'
import { gracefullyError } from '@/utils/shared/gracefullyError'
import {
  DEFAULT_SUPPORTED_COUNTRY_CODE,
  SupportedCountryCodes,
} from '@/utils/shared/supportedCountries'
import { AUUserActionEmailCampaignName } from '@/utils/shared/userActionCampaigns/au/auUserActionCampaigns'
import { CAUserActionEmailCampaignName } from '@/utils/shared/userActionCampaigns/ca/caUserActionCampaigns'
import { GBUserActionEmailCampaignName } from '@/utils/shared/userActionCampaigns/gb/gbUserActionCampaigns'
import { USUserActionEmailCampaignName } from '@/utils/shared/userActionCampaigns/us/usUserActionCampaigns'

const USUserActionFormEmailCongressperson = dynamic(
  () =>
    import('@/components/app/userActionFormEmailCongressperson/us').then(
      mod => mod.USUserActionFormEmailCongressperson,
    ),
  {
    loading: () => (
      <UserActionFormEmailCongresspersonSkeleton
        campaignName={USUserActionEmailCampaignName.DEFAULT}
        countryCode={SupportedCountryCodes.US}
      />
    ),
  },
)

const AUUserActionFormEmailCongressperson = dynamic(
  () =>
    import('@/components/app/userActionFormEmailCongressperson/au').then(
      mod => mod.AUUserActionFormEmailCongressperson,
    ),
  {
    loading: () => (
      <UserActionFormEmailCongresspersonSkeleton
        campaignName={AUUserActionEmailCampaignName.DEFAULT}
        countryCode={SupportedCountryCodes.AU}
      />
    ),
  },
)

const CAUserActionFormEmailCongressperson = dynamic(
  () =>
    import('@/components/app/userActionFormEmailCongressperson/ca').then(
      mod => mod.CAUserActionFormEmailCongressperson,
    ),
  {
    loading: () => (
      <UserActionFormEmailCongresspersonSkeleton
        campaignName={CAUserActionEmailCampaignName.DEFAULT}
        countryCode={SupportedCountryCodes.CA}
      />
    ),
  },
)

const GBUserActionFormEmailCongressperson = dynamic(
  () =>
    import('@/components/app/userActionFormEmailCongressperson/gb').then(
      mod => mod.GBUserActionFormEmailCongressperson,
    ),
  {
    loading: () => (
      <UserActionFormEmailCongresspersonSkeleton
        campaignName={GBUserActionEmailCampaignName.DEFAULT}
        countryCode={SupportedCountryCodes.GB}
      />
    ),
  },
)

export function UserActionFormEmailCongressperson(props: UserActionFormEmailCongresspersonProps) {
  const { countryCode } = props

  switch (countryCode) {
    case SupportedCountryCodes.US:
      return <USUserActionFormEmailCongressperson {...props} />
    case SupportedCountryCodes.AU:
      return <AUUserActionFormEmailCongressperson {...props} />
    case SupportedCountryCodes.CA:
      return <CAUserActionFormEmailCongressperson {...props} />
    case SupportedCountryCodes.GB:
      return <GBUserActionFormEmailCongressperson {...props} />
    default:
      return gracefullyError({
        msg: `Country implementation not found for UserActionFormEmailCongressperson`,
        fallback: (
          <UserActionFormActionUnavailable
            countryCode={countryCode || DEFAULT_SUPPORTED_COUNTRY_CODE}
          />
        ),
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
}
