import dynamic from 'next/dynamic'

import { AUUserActionFormReferSkeleton } from '@/components/app/userActionFormRefer/au/skeleton'
import { CAUserActionFormReferSkeleton } from '@/components/app/userActionFormRefer/ca/skeleton'
import { UserActionFormReferProps } from '@/components/app/userActionFormRefer/common/types'
import { GBUserActionFormReferSkeleton } from '@/components/app/userActionFormRefer/gb/skeleton'
import { USUserActionFormReferSkeleton } from '@/components/app/userActionFormRefer/us/skeleton'
import { gracefullyError } from '@/utils/shared/gracefullyError'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'

const AUUserActionFormRefer = dynamic(
  () => import('@/components/app/userActionFormRefer/au').then(mod => mod.AUUserActionFormRefer),
  {
    loading: () => <AUUserActionFormReferSkeleton />,
  },
)

const CAUserActionFormRefer = dynamic(
  () => import('@/components/app/userActionFormRefer/ca').then(mod => mod.CAUserActionFormRefer),
  {
    loading: () => <CAUserActionFormReferSkeleton />,
  },
)

const GBUserActionFormRefer = dynamic(
  () => import('@/components/app/userActionFormRefer/gb').then(mod => mod.GBUserActionFormRefer),
  {
    loading: () => <GBUserActionFormReferSkeleton />,
  },
)

const USUserActionFormRefer = dynamic(
  () => import('@/components/app/userActionFormRefer/us').then(mod => mod.USUserActionFormRefer),
  {
    loading: () => <USUserActionFormReferSkeleton />,
  },
)

export function getUserActionFormRefer(props: UserActionFormReferProps) {
  const { countryCode } = props

  switch (countryCode) {
    case SupportedCountryCodes.US:
      return USUserActionFormRefer
    case SupportedCountryCodes.GB:
      return GBUserActionFormRefer
    case SupportedCountryCodes.CA:
      return CAUserActionFormRefer
    case SupportedCountryCodes.AU:
      return AUUserActionFormRefer
    default:
      return gracefullyError({
        msg: `Country implementation not found for UserActionFormRefer`,
        fallback: null,
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
