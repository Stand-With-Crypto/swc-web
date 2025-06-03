'use client'

import dynamic from 'next/dynamic'
import { z } from 'zod'

import { UserActionFormActionUnavailable } from '@/components/app/userActionFormCommon/actionUnavailable'
import { UserActionFormEmailCongresspersonSkeleton } from '@/components/app/userActionFormEmailCongressperson/common/skeleton'
import { UserActionFormEmailCongresspersonProps } from '@/components/app/userActionFormEmailCongressperson/common/types'
import { gracefullyError } from '@/utils/shared/gracefullyError'
import {
  DEFAULT_SUPPORTED_COUNTRY_CODE,
  SupportedCountryCodes,
} from '@/utils/shared/supportedCountries'
import { GenericErrorFormValues } from '@/utils/web/formUtils'
import { zodUserActionFormEmailCongresspersonFields } from '@/validation/forms/zodUserActionFormEmailCongressperson'

const USUserActionFormEmailCongressperson = dynamic(
  () =>
    import('@/components/app/userActionFormEmailCongressperson/us').then(
      mod => mod.USUserActionFormEmailCongressperson,
    ),
  {
    loading: () => (
      <UserActionFormEmailCongresspersonSkeleton countryCode={SupportedCountryCodes.US} />
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
      <UserActionFormEmailCongresspersonSkeleton countryCode={SupportedCountryCodes.AU} />
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
      <UserActionFormEmailCongresspersonSkeleton countryCode={SupportedCountryCodes.CA} />
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
      <UserActionFormEmailCongresspersonSkeleton countryCode={SupportedCountryCodes.GB} />
    ),
  },
)

export type EmailActionFormValues = z.infer<typeof zodUserActionFormEmailCongresspersonFields> &
  GenericErrorFormValues

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
