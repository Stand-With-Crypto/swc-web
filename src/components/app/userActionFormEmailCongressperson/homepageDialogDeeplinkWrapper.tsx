'use client'

import React, { Suspense, useEffect } from 'react'
import { useRouter } from 'next/navigation'

import { GeoGate } from '@/components/app/geoGate'
import { UserActionFormActionUnavailable } from '@/components/app/userActionFormCommon/actionUnavailable'
import { ANALYTICS_NAME_USER_ACTION_FORM_EMAIL_CONGRESSPERSON } from '@/components/app/userActionFormEmailCongressperson/common/constants'
import { UserActionFormEmailCongresspersonSkeleton } from '@/components/app/userActionFormEmailCongressperson/skeleton'
import { FormFields } from '@/components/app/userActionFormEmailCongressperson/types'
import { USUserActionFormEmailCongressperson } from '@/components/app/userActionFormEmailCongressperson/us'
import { trackDialogOpen } from '@/components/ui/dialog/trackDialogOpen'
import { useApiResponseForUserFullProfileInfo } from '@/hooks/useApiResponseForUserFullProfileInfo'
import { useCountryCode } from '@/hooks/useCountryCode'
import { useEncodedInitialValuesQueryParam } from '@/hooks/useEncodedInitialValuesQueryParam'
import { usePreventOverscroll } from '@/hooks/usePreventOverscroll'
import { DEFAULT_SUPPORTED_COUNTRY_CODE } from '@/utils/shared/supportedCountries'
import { getIntlUrls } from '@/utils/shared/urls'

function UserActionFormEmailCongresspersonDeeplinkWrapperContent() {
  usePreventOverscroll()

  const fetchUser = useApiResponseForUserFullProfileInfo()
  const router = useRouter()
  const countryCode = useCountryCode()
  const urls = getIntlUrls(countryCode)
  const { user } = fetchUser.data || { user: null }

  const [initialValues, loadingParams] = useEncodedInitialValuesQueryParam<FormFields>({
    address: {
      description: '',
      place_id: '',
    },
    email: '',
    firstName: '',
    lastName: '',
  })
  useEffect(() => {
    trackDialogOpen({ open: true, analytics: ANALYTICS_NAME_USER_ACTION_FORM_EMAIL_CONGRESSPERSON })
  }, [])

  if (fetchUser.isLoading || loadingParams) {
    return <UserActionFormEmailCongresspersonSkeleton countryCode={countryCode} />
  }

  return (
    <USUserActionFormEmailCongressperson
      countryCode={countryCode}
      initialValues={initialValues}
      onCancel={() => router.replace(urls.home())}
      user={user}
    />
  )
}

export function UserActionFormEmailCongresspersonDeeplinkWrapper() {
  const countryCode = useCountryCode()
  return (
    <GeoGate
      countryCode={DEFAULT_SUPPORTED_COUNTRY_CODE}
      unavailableContent={
        <UserActionFormActionUnavailable countryCode={DEFAULT_SUPPORTED_COUNTRY_CODE} />
      }
    >
      <Suspense fallback={<UserActionFormEmailCongresspersonSkeleton countryCode={countryCode} />}>
        <UserActionFormEmailCongresspersonDeeplinkWrapperContent />
      </Suspense>
    </GeoGate>
  )
}
