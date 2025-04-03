import dynamic from 'next/dynamic'

import { UserActionFormActionUnavailable } from '@/components/app/userActionFormCommon/actionUnavailable'
import { UserActionFormReferSkeleton } from '@/components/app/userActionFormRefer/common/skeleton'
import { UserActionFormReferProps } from '@/components/app/userActionFormRefer/common/types'
import { gracefullyError } from '@/utils/shared/gracefullyError'
import {
  DEFAULT_SUPPORTED_COUNTRY_CODE,
  SupportedCountryCodes,
} from '@/utils/shared/supportedCountries'

const AUUserActionFormRefer = dynamic(
  () => import('@/components/app/userActionFormRefer/au').then(mod => mod.AUUserActionFormRefer),
  {
    loading: () => <UserActionFormReferSkeleton countryCode={SupportedCountryCodes.AU} />,
  },
)

const CAUserActionFormRefer = dynamic(
  () => import('@/components/app/userActionFormRefer/ca').then(mod => mod.CAUserActionFormRefer),
  {
    loading: () => <UserActionFormReferSkeleton countryCode={SupportedCountryCodes.CA} />,
  },
)

const GBUserActionFormRefer = dynamic(
  () => import('@/components/app/userActionFormRefer/gb').then(mod => mod.GBUserActionFormRefer),
  {
    loading: () => <UserActionFormReferSkeleton countryCode={SupportedCountryCodes.GB} />,
  },
)

const USUserActionFormRefer = dynamic(
  () => import('@/components/app/userActionFormRefer/us').then(mod => mod.USUserActionFormRefer),
  {
    loading: () => <UserActionFormReferSkeleton countryCode={SupportedCountryCodes.US} />,
  },
)

export function UserActionFormRefer(props: UserActionFormReferProps) {
  const { countryCode } = props

  switch (countryCode) {
    case SupportedCountryCodes.US:
      return <USUserActionFormRefer {...props} />
    case SupportedCountryCodes.GB:
      return <GBUserActionFormRefer {...props} />
    case SupportedCountryCodes.CA:
      return <CAUserActionFormRefer {...props} />
    case SupportedCountryCodes.AU:
      return <AUUserActionFormRefer {...props} />
    default:
      return gracefullyError({
        msg: `Country implementation not found for UserActionFormRefer`,
        fallback: <UserActionFormActionUnavailable countryCode={DEFAULT_SUPPORTED_COUNTRY_CODE} />,
        hint: {
          level: 'error',
          tags: {
            domain: 'UserActionFormRefer',
          },
          extra: {
            countryCode,
          },
        },
      })
  }
}
