'use client'

import React, { Suspense, useState } from 'react'
import { useRouter } from 'next/navigation'

import { UserActionFormEmailCongressperson } from '@/components/app/userActionFormEmailCongressperson'
import { UserActionFormEmailCongresspersonSkeleton } from '@/components/app/userActionFormEmailCongressperson/skeleton'
import { FormFields } from '@/components/app/userActionFormEmailCongressperson/types'
import { UserActionFormSuccessScreen } from '@/components/app/userActionFormSuccessScreen'
import { useApiResponseForUserFullProfileInfo } from '@/hooks/useApiResponseForUserFullProfileInfo'
import { useEncodedInitialValuesQueryParam } from '@/hooks/useEncodedInitialValuesQueryParam'
import { useLocale } from '@/hooks/useLocale'
import { getIntlUrls } from '@/utils/shared/urls'

function UserActionFormEmailCongresspersonDeeplinkWrapperContent() {
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
    firstName: '',
    lastName: '',
  })

  return fetchUser.isLoading || loadingParams ? (
    <UserActionFormEmailCongresspersonSkeleton locale={locale} />
  ) : state === 'form' ? (
    <UserActionFormEmailCongressperson
      initialValues={initialValues}
      onCancel={() => router.replace(urls.home())}
      onSuccess={() => setState('success')}
      user={user}
    />
  ) : (
    <UserActionFormSuccessScreen onClose={() => router.replace(urls.home())} />
  )
}

export function UserActionFormEmailCongresspersonDeeplinkWrapper() {
  const locale = useLocale()
  return (
    <Suspense fallback={<UserActionFormEmailCongresspersonSkeleton locale={locale} />}>
      <UserActionFormEmailCongresspersonDeeplinkWrapperContent />
    </Suspense>
  )
}
