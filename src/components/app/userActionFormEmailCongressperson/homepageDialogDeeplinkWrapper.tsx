'use client'

import React, { Suspense, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

import { GeoGate } from '@/components/app/geoGate'
import { UserActionFormActionUnavailable } from '@/components/app/userActionFormCommon/actionUnavailable'
import { UserActionFormEmailCongressperson } from '@/components/app/userActionFormEmailCongressperson'
import { ANALYTICS_NAME_USER_ACTION_FORM_EMAIL_CONGRESSPERSON } from '@/components/app/userActionFormEmailCongressperson/constants'
import { UserActionFormEmailCongresspersonSkeleton } from '@/components/app/userActionFormEmailCongressperson/skeleton'
import { UserActionFormEmailCongresspersonSuccess } from '@/components/app/userActionFormEmailCongressperson/success'
import { FormFields } from '@/components/app/userActionFormEmailCongressperson/types'
import { UserActionFormSuccessScreen } from '@/components/app/userActionFormSuccessScreen'
import { dialogContentPaddingStyles } from '@/components/ui/dialog/styles'
import { trackDialogOpen } from '@/components/ui/dialog/trackDialogOpen'
import { useApiResponseForUserFullProfileInfo } from '@/hooks/useApiResponseForUserFullProfileInfo'
import { useCountryCode } from '@/hooks/useCountryCode'
import { useEncodedInitialValuesQueryParam } from '@/hooks/useEncodedInitialValuesQueryParam'
import { usePreventOverscroll } from '@/hooks/usePreventOverscroll'
import { DEFAULT_SUPPORTED_COUNTRY_CODE } from '@/utils/shared/supportedCountries'
import { getIntlUrls } from '@/utils/shared/urls'
import { cn } from '@/utils/web/cn'

function UserActionFormEmailCongresspersonDeeplinkWrapperContent() {
  usePreventOverscroll()

  const fetchUser = useApiResponseForUserFullProfileInfo()
  const router = useRouter()
  const countryCode = useCountryCode()
  const urls = getIntlUrls(countryCode)
  const [state, setState] = useState<'form' | 'success'>('form')
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

  return fetchUser.isLoading || loadingParams ? (
    <UserActionFormEmailCongresspersonSkeleton countryCode={countryCode} />
  ) : state === 'form' ? (
    <UserActionFormEmailCongressperson
      initialValues={initialValues}
      onCancel={() => router.replace(urls.home())}
      onSuccess={() => setState('success')}
      user={user}
    />
  ) : (
    <div className={cn(dialogContentPaddingStyles, 'h-full')}>
      <UserActionFormSuccessScreen onClose={() => router.replace(urls.home())}>
        <UserActionFormEmailCongresspersonSuccess />
      </UserActionFormSuccessScreen>
    </div>
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
