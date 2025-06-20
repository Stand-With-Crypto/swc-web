'use client'

import React, { Suspense, useEffect } from 'react'
import { useRouter } from 'next/navigation'

import { GeoGate } from '@/components/app/geoGate'
import { UserActionFormActionUnavailable } from '@/components/app/userActionFormCommon/actionUnavailable'
import { UserActionFormEmailCongressperson } from '@/components/app/userActionFormEmailCongressperson'
import { ANALYTICS_NAME_USER_ACTION_FORM_EMAIL_CONGRESSPERSON } from '@/components/app/userActionFormEmailCongressperson/common/constants'
import { UserActionFormEmailCongresspersonSkeleton } from '@/components/app/userActionFormEmailCongressperson/common/skeleton'
import {
  EmailActionCampaignNames,
  FormFields,
} from '@/components/app/userActionFormEmailCongressperson/common/types'
import { trackDialogOpen } from '@/components/ui/dialog/trackDialogOpen'
import { useApiResponseForUserFullProfileInfo } from '@/hooks/useApiResponseForUserFullProfileInfo'
import { useEncodedInitialValuesQueryParam } from '@/hooks/useEncodedInitialValuesQueryParam'
import { usePreventOverscroll } from '@/hooks/usePreventOverscroll'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { getIntlUrls } from '@/utils/shared/urls'

interface UserActionFormEmailCongresspersonDeeplinkWrapperProps {
  countryCode: SupportedCountryCodes
  campaignName: EmailActionCampaignNames
}

function UserActionFormEmailCongresspersonDeeplinkWrapperContent(
  props: UserActionFormEmailCongresspersonDeeplinkWrapperProps,
) {
  const { countryCode } = props
  usePreventOverscroll()

  const fetchUser = useApiResponseForUserFullProfileInfo()
  const router = useRouter()
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
    return <UserActionFormEmailCongresspersonSkeleton {...props} />
  }

  return (
    <UserActionFormEmailCongressperson
      {...props}
      initialValues={initialValues}
      onCancel={() => router.replace(urls.home())}
      user={user}
    />
  )
}

export function UserActionFormEmailCongresspersonDeeplinkWrapper(
  props: UserActionFormEmailCongresspersonDeeplinkWrapperProps,
) {
  const { countryCode } = props

  return (
    <GeoGate
      countryCode={countryCode}
      unavailableContent={<UserActionFormActionUnavailable countryCode={countryCode} />}
    >
      <Suspense fallback={<UserActionFormEmailCongresspersonSkeleton {...props} />}>
        <UserActionFormEmailCongresspersonDeeplinkWrapperContent {...props} />
      </Suspense>
    </GeoGate>
  )
}
