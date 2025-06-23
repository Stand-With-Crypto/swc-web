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

export function UserActionFormEmailCongressperson(props: UserActionFormEmailCongresspersonProps) {
  const { countryCode } = props

  const LazyUserActionFormEmailCongressperson = useMemo(() => {
    switch (countryCode) {
      case SupportedCountryCodes.US:
        return <LazyUSUserActionFormEmailCongressperson {...props} />
      case SupportedCountryCodes.AU:
        return <LazyAUUserActionFormEmailCongressperson {...props} />
      case SupportedCountryCodes.CA:
        return <LazyCAUserActionFormEmailCongressperson {...props} />
      case SupportedCountryCodes.GB:
        return <LazyGBUserActionFormEmailCongressperson {...props} />
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
