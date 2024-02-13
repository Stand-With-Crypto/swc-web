'use client'

import { Suspense } from 'react'
import { useRouter } from 'next/navigation'

import { UserActionFormCallCongressperson } from '@/components/app/userActionFormCallCongressperson'
import { UserActionFormCallCongresspersonSkeleton } from '@/components/app/userActionFormCallCongressperson/skeleton'
import { FormFields } from '@/components/app/userActionFormCallCongressperson/types'
import { useApiResponseForUserFullProfileInfo } from '@/hooks/useApiResponseForUserFullProfileInfo'
import { useEncodedInitialValuesQueryParam } from '@/hooks/useEncodedInitialValuesQueryParam'
import { useIntlUrls } from '@/hooks/useIntlUrls'

function UserActionFormCallCongresspersonDeeplinkWrapperContent() {
  const fetchUser = useApiResponseForUserFullProfileInfo()
  const urls = useIntlUrls()
  const router = useRouter()
  const { user } = fetchUser.data || { user: null }
  const [initialValues, loadingParams] = useEncodedInitialValuesQueryParam<FormFields>({
    address: {
      description: '',
      place_id: '',
    },
  })

  return fetchUser.isLoading || loadingParams ? (
    <UserActionFormCallCongresspersonSkeleton />
  ) : (
    <UserActionFormCallCongressperson
      initialValues={initialValues}
      onClose={() => router.push(urls.home())}
      user={user}
    />
  )
}

export function UserActionFormCallCongresspersonDeeplinkWrapper() {
  return (
    <Suspense fallback={<UserActionFormCallCongresspersonSkeleton />}>
      <UserActionFormCallCongresspersonDeeplinkWrapperContent />
    </Suspense>
  )
}
