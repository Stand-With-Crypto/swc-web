'use client'

import React, { Suspense, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

import { UserActionFormEmailDebate } from '@/components/app/userActionFormEmailDebate'
import { ANALYTICS_NAME_USER_ACTION_FORM_EMAIL_DEBATE } from '@/components/app/userActionFormEmailDebate/constants'
import { UserActionFormEmailDebateSkeleton } from '@/components/app/userActionFormEmailDebate/skeleton'
import { UserActionFormEmailDebateSuccess } from '@/components/app/userActionFormEmailDebate/success'
import { UserActionEmailDebateFormFields } from '@/components/app/userActionFormEmailDebate/types'
import { UserActionFormSuccessScreen } from '@/components/app/userActionFormSuccessScreen'
import { dialogContentPaddingStyles } from '@/components/ui/dialog/styles'
import { trackDialogOpen } from '@/components/ui/dialog/trackDialogOpen'
import { useApiResponseForUserFullProfileInfo } from '@/hooks/useApiResponseForUserFullProfileInfo'
import { useCountryCode } from '@/hooks/useCountryCode'
import { useEncodedInitialValuesQueryParam } from '@/hooks/useEncodedInitialValuesQueryParam'
import { usePreventOverscroll } from '@/hooks/usePreventOverscroll'
import { getIntlUrls } from '@/utils/shared/urls'
import { cn } from '@/utils/web/cn'

function UserActionFormEmailDebateDeeplinkWrapperContent() {
  usePreventOverscroll()

  const fetchUser = useApiResponseForUserFullProfileInfo()
  const router = useRouter()
  const countryCode = useCountryCode()
  const urls = getIntlUrls(countryCode)
  const [state, setState] = useState<'form' | 'success'>('form')
  const { user } = fetchUser.data || { user: null }
  const [initialValues, loadingParams] =
    useEncodedInitialValuesQueryParam<UserActionEmailDebateFormFields>({
      email: '',
      firstName: '',
      lastName: '',
      address: {
        description: '',
        place_id: '',
      },
    })
  useEffect(() => {
    trackDialogOpen({ open: true, analytics: ANALYTICS_NAME_USER_ACTION_FORM_EMAIL_DEBATE })
  }, [])

  return fetchUser.isLoading || loadingParams ? (
    <UserActionFormEmailDebateSkeleton />
  ) : state === 'form' ? (
    <UserActionFormEmailDebate
      initialValues={initialValues}
      onCancel={() => router.replace(urls.home())}
      onSuccess={() => setState('success')}
      user={user}
    />
  ) : (
    <div className={cn(dialogContentPaddingStyles, 'h-full')}>
      <UserActionFormSuccessScreen onClose={() => router.replace(urls.home())}>
        <UserActionFormEmailDebateSuccess />
      </UserActionFormSuccessScreen>
    </div>
  )
}

export function UserActionFormEmailDebateDeeplinkWrapper() {
  return (
    <Suspense fallback={<UserActionFormEmailDebateSkeleton />}>
      <UserActionFormEmailDebateDeeplinkWrapperContent />
    </Suspense>
  )
}
