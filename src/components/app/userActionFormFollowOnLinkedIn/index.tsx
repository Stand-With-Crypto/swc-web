'use client'
import dynamic from 'next/dynamic'

import { UserActionFormActionUnavailable } from '@/components/app/userActionFormCommon/actionUnavailable'
import { UserActionFormFollowLinkedInSkeleton } from '@/components/app/userActionFormFollowOnLinkedIn/common/skeleton'
import { UserActionFormFollowLinkedInProps } from '@/components/app/userActionFormFollowOnLinkedIn/common/types'
import { gracefullyError } from '@/utils/shared/gracefullyError'
import {
  DEFAULT_SUPPORTED_COUNTRY_CODE,
  SupportedCountryCodes,
} from '@/utils/shared/supportedCountries'

const AUUserActionFormFollowLinkedIn = dynamic(
  () =>
    import('@/components/app/userActionFormFollowOnLinkedIn/au').then(
      mod => mod.AUUserActionFormFollowLinkedIn,
    ),
  {
    loading: () => <UserActionFormFollowLinkedInSkeleton />,
  },
)

const CAUserActionFormFollowLinkedIn = dynamic(
  () =>
    import('@/components/app/userActionFormFollowOnLinkedIn/ca').then(
      mod => mod.CAUserActionFormFollowLinkedIn,
    ),
  {
    loading: () => <UserActionFormFollowLinkedInSkeleton />,
  },
)

const GBUserActionFormFollowLinkedIn = dynamic(
  () =>
    import('@/components/app/userActionFormFollowOnLinkedIn/gb').then(
      mod => mod.GBUserActionFormFollowLinkedIn,
    ),
  {
    loading: () => <UserActionFormFollowLinkedInSkeleton />,
  },
)

export function UserActionFormFollowLinkedIn(props: UserActionFormFollowLinkedInProps) {
  const { countryCode } = props

  switch (countryCode) {
    case SupportedCountryCodes.GB:
      return <GBUserActionFormFollowLinkedIn {...props} />
    case SupportedCountryCodes.CA:
      return <CAUserActionFormFollowLinkedIn {...props} />
    case SupportedCountryCodes.AU:
      return <AUUserActionFormFollowLinkedIn {...props} />
    default:
      return gracefullyError({
        msg: `Country implementation not found for UserActionFormFollowLinkedIn`,
        fallback: (
          <UserActionFormActionUnavailable
            countryCode={countryCode || DEFAULT_SUPPORTED_COUNTRY_CODE}
          />
        ),
        hint: {
          level: 'error',
          tags: {
            domain: 'UserActionFormFollowLinkedIn',
          },
          extra: {
            countryCode,
          },
        },
      })
  }
}
