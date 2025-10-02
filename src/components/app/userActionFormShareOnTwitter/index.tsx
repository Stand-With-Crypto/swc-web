'use client'
import dynamic from 'next/dynamic'

import { UserActionFormActionUnavailable } from '@/components/app/userActionFormCommon/actionUnavailable'
import { UserActionFormShareOnTwitterSkeleton } from '@/components/app/userActionFormShareOnTwitter/common/skeleton'
import { UserActionFormShareOnTwitterProps } from '@/components/app/userActionFormShareOnTwitter/common/types'
import { gracefullyError } from '@/utils/shared/gracefullyError'
import {
  DEFAULT_SUPPORTED_COUNTRY_CODE,
  SupportedCountryCodes,
} from '@/utils/shared/supportedCountries'

const AUUserActionFormShareOnTwitter = dynamic(
  () =>
    import('@/components/app/userActionFormShareOnTwitter/au').then(
      mod => mod.AUUserActionFormShareOnTwitter,
    ),
  {
    loading: () => <UserActionFormShareOnTwitterSkeleton />,
  },
)

const CAUserActionFormShareOnTwitter = dynamic(
  () =>
    import('@/components/app/userActionFormShareOnTwitter/ca').then(
      mod => mod.CAUserActionFormShareOnTwitter,
    ),
  {
    loading: () => <UserActionFormShareOnTwitterSkeleton />,
  },
)

const GBUserActionFormShareOnTwitter = dynamic(
  () =>
    import('@/components/app/userActionFormShareOnTwitter/gb').then(
      mod => mod.GBUserActionFormShareOnTwitter,
    ),
  {
    loading: () => <UserActionFormShareOnTwitterSkeleton />,
  },
)

const USUserActionFormShareOnTwitter = dynamic(
  () =>
    import('@/components/app/userActionFormShareOnTwitter/us').then(
      mod => mod.USUserActionFormShareOnTwitter,
    ),
  {
    loading: () => <UserActionFormShareOnTwitterSkeleton />,
  },
)

const EUUserActionFormShareOnTwitter = dynamic(
  () =>
    import('@/components/app/userActionFormShareOnTwitter/eu').then(
      mod => mod.EUUserActionFormShareOnTwitter,
    ),
  {
    loading: () => <UserActionFormShareOnTwitterSkeleton />,
  },
)

export function UserActionFormShareOnTwitter(props: UserActionFormShareOnTwitterProps) {
  const { countryCode } = props

  switch (countryCode) {
    case SupportedCountryCodes.US:
      return <USUserActionFormShareOnTwitter {...props} />
    case SupportedCountryCodes.GB:
      return <GBUserActionFormShareOnTwitter {...props} />
    case SupportedCountryCodes.CA:
      return <CAUserActionFormShareOnTwitter {...props} />
    case SupportedCountryCodes.AU:
      return <AUUserActionFormShareOnTwitter {...props} />
    case SupportedCountryCodes.EU:
      return <EUUserActionFormShareOnTwitter {...props} />
    default:
      return gracefullyError({
        msg: `Country implementation not found for UserActionFormShareOnTwitter`,
        fallback: (
          <UserActionFormActionUnavailable
            countryCode={countryCode || DEFAULT_SUPPORTED_COUNTRY_CODE}
          />
        ),
        hint: {
          level: 'error',
          tags: {
            domain: 'UserActionFormShareOnTwitter',
          },
          extra: {
            countryCode,
          },
        },
      })
  }
}
