'use client'

import React, { Suspense, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

import { UserActionFormEmailCNN } from '@/components/app/userActionFormEmailCNN'
import { ANALYTICS_NAME_USER_ACTION_FORM_EMAIL_CNN } from '@/components/app/userActionFormEmailCNN/constants'
import { UserActionFormEmailCNNSkeleton } from '@/components/app/userActionFormEmailCNN/skeleton'
import { FormFields } from '@/components/app/userActionFormEmailCongressperson/types'
import { UserActionFormSuccessScreen } from '@/components/app/userActionFormSuccessScreen'
import { dialogContentPaddingStyles } from '@/components/ui/dialog/styles'
import { trackDialogOpen } from '@/components/ui/dialog/trackDialogOpen'
import { useApiResponseForUserFullProfileInfo } from '@/hooks/useApiResponseForUserFullProfileInfo'
import { useEncodedInitialValuesQueryParam } from '@/hooks/useEncodedInitialValuesQueryParam'
import { useLocale } from '@/hooks/useLocale'
import { usePreventOverscroll } from '@/hooks/usePreventOverscroll'
import { getIntlUrls } from '@/utils/shared/urls'
import { cn } from '@/utils/web/cn'

function UserActionFormEmailCNNDeeplinkWrapperContent() {
  usePreventOverscroll()

  const fetchUser = useApiResponseForUserFullProfileInfo()
  const router = useRouter()
  const locale = useLocale()
  const urls = getIntlUrls(locale)
  const [state, setState] = useState<'form' | 'success'>('form')
  const { user } = fetchUser.data || { user: null }
  const [initialValues, loadingParams] = useEncodedInitialValuesQueryParam<FormFields>({
    address: {
      description: '',
      place_id: '',
    },
    email: '',
    fullName: '',
  })
  useEffect(() => {
    trackDialogOpen({ open: true, analytics: ANALYTICS_NAME_USER_ACTION_FORM_EMAIL_CNN })
  }, [])

  return fetchUser.isLoading || loadingParams ? (
    <UserActionFormEmailCNNSkeleton locale={locale} />
  ) : state === 'form' ? (
    <UserActionFormEmailCNN
      initialValues={initialValues}
      onCancel={() => router.replace(urls.home())}
      onSuccess={() => setState('success')}
      user={user}
    />
  ) : (
    <div className={cn(dialogContentPaddingStyles)}>
      <UserActionFormSuccessScreen onClose={() => router.replace(urls.home())} />
    </div>
  )
}

export function UserActionFormEmailCNNDeeplinkWrapper() {
  const locale = useLocale()
  return (
    <Suspense fallback={<UserActionFormEmailCNNSkeleton locale={locale} />}>
      <UserActionFormEmailCNNDeeplinkWrapperContent />
    </Suspense>
  )
}
