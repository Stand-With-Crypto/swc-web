'use client'

import { Suspense, useMemo } from 'react'

import { UserActionFormLetterSkeleton } from '@/components/app/userActionFormLetter/common/skeleton'
import {
  FormFields,
  UserActionFormLetterProps,
} from '@/components/app/userActionFormLetter/common/types'
import { LazyAUUserActionFormLetter } from '@/components/app/userActionFormLetter/lazyLoad'
import { useApiResponseForUserFullProfileInfo } from '@/hooks/useApiResponseForUserFullProfileInfo'
import { useEncodedInitialValuesQueryParam } from '@/hooks/useEncodedInitialValuesQueryParam'
import { gracefullyError } from '@/utils/shared/gracefullyError'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { AUUserActionLetterCampaignName } from '@/utils/shared/userActionCampaigns/au/auUserActionCampaigns'

export function UserActionFormLetter(props: UserActionFormLetterProps) {
  const { countryCode } = props

  const fetchUser = useApiResponseForUserFullProfileInfo()

  const [initialValues] = useEncodedInitialValuesQueryParam<FormFields>({
    address: {
      description: '',
      place_id: '',
    },
    firstName: '',
    lastName: '',
  })

  const commonProps = useMemo(() => {
    const { user } = fetchUser.data || { user: null }

    return {
      ...props,
      initialValues,
      user,
      countryCode,
    }
  }, [countryCode, props, initialValues, fetchUser])

  const LazyUserActionFormLetterComponent = useMemo(() => {
    switch (countryCode) {
      case SupportedCountryCodes.AU:
        return (
          <LazyAUUserActionFormLetter
            {...commonProps}
            campaignName={props.campaignName as AUUserActionLetterCampaignName}
          />
        )
      default:
        return gracefullyError({
          msg: `Country implementation not found for UserActionFormLetter`,
          fallback: null,
          hint: {
            level: 'error',
            tags: {
              domain: 'UserActionFormLetter',
            },
            extra: {
              countryCode,
            },
          },
        })
    }
  }, [countryCode, props, commonProps])

  return (
    <Suspense fallback={<UserActionFormLetterSkeleton {...props} />}>
      {LazyUserActionFormLetterComponent}
    </Suspense>
  )
}
