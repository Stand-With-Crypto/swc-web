'use client'

import dynamic from 'next/dynamic'
import { z } from 'zod'

import { UserActionFormActionUnavailable } from '@/components/app/userActionFormCommon/actionUnavailable'
import { UserActionFormEmailCongresspersonSkeleton } from '@/components/app/userActionFormEmailCongressperson/skeleton'
import { UserActionFormEmailCongresspersonProps } from '@/components/app/userActionFormEmailCongressperson/types'
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

export type EmailActionFormValues = z.infer<typeof zodUserActionFormEmailCongresspersonFields> &
  GenericErrorFormValues

export function UserActionFormEmailCongressperson(props: UserActionFormEmailCongresspersonProps) {
  const { countryCode } = props

  switch (countryCode) {
    case SupportedCountryCodes.US:
      return <USUserActionFormEmailCongressperson {...props} />
    // case SupportedCountryCodes.GB:
    //   return <GBUserActionFormEmailCongressperson {...props} />
    // case SupportedCountryCodes.CA:
    //   return <CAUserActionFormEmailCongressperson {...props} />
    // case SupportedCountryCodes.AU:
    //   return <AUUserActionFormEmailCongressperson {...props} />
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
