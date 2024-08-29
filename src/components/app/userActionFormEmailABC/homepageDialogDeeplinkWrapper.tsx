'use client'

import React, { Suspense, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

import { UserActionFormEmailABC } from '@/components/app/userActionFormEmailABC'
import { ANALYTICS_NAME_USER_ACTION_FORM_EMAIL_ABC } from '@/components/app/userActionFormEmailABC/constants'
import { UserActionFormEmailABCSkeleton } from '@/components/app/userActionFormEmailABC/skeleton'
import { UserActionFormEmailABCSuccess } from '@/components/app/userActionFormEmailABC/success'
import { UserActionEmailABCFormFields } from '@/components/app/userActionFormEmailABC/types'
import { UserActionFormSuccessScreen } from '@/components/app/userActionFormSuccessScreen'
import { dialogContentPaddingStyles } from '@/components/ui/dialog/styles'
import { trackDialogOpen } from '@/components/ui/dialog/trackDialogOpen'
import { useApiResponseForUserFullProfileInfo } from '@/hooks/useApiResponseForUserFullProfileInfo'
import { useEncodedInitialValuesQueryParam } from '@/hooks/useEncodedInitialValuesQueryParam'
import { useLocale } from '@/hooks/useLocale'
import { usePreventOverscroll } from '@/hooks/usePreventOverscroll'
import { getIntlUrls } from '@/utils/shared/urls'
import { cn } from '@/utils/web/cn'

function UserActionFormEmailABCDeeplinkWrapperContent() {
  usePreventOverscroll()

  const fetchUser = useApiResponseForUserFullProfileInfo()
  const router = useRouter()
  const locale = useLocale()
  const urls = getIntlUrls(locale)
  const [state, setState] = useState<'form' | 'success'>('form')
  const { user } = fetchUser.data || { user: null }
  const [initialValues, loadingParams] =
    useEncodedInitialValuesQueryParam<UserActionEmailABCFormFields>({
      email: '',
      firstName: '',
      lastName: '',
      address: {
        description: '',
        place_id: '',
      },
    })
  useEffect(() => {
    trackDialogOpen({ open: true, analytics: ANALYTICS_NAME_USER_ACTION_FORM_EMAIL_ABC })
  }, [])

  return fetchUser.isLoading || loadingParams ? (
    <UserActionFormEmailABCSkeleton />
  ) : state === 'form' ? (
    <UserActionFormEmailABC
      initialValues={initialValues}
      onCancel={() => router.replace(urls.home())}
      onSuccess={() => setState('success')}
      user={user}
    />
  ) : (
    <div className={cn(dialogContentPaddingStyles, 'h-full')}>
      <UserActionFormSuccessScreen onClose={() => router.replace(urls.home())}>
        <UserActionFormEmailABCSuccess />
      </UserActionFormSuccessScreen>
    </div>
  )
}

export function UserActionFormEmailABCDeeplinkWrapper() {
  return (
    <Suspense fallback={<UserActionFormEmailABCSkeleton />}>
      <UserActionFormEmailABCDeeplinkWrapperContent />
    </Suspense>
  )
}
