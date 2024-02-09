'use client'

import { Suspense } from 'react'
import { useRouter } from 'next/navigation'

import { UserActionFormCallCongressperson } from '@/components/app/userActionFormCallCongressperson'
import { UserActionFormCallCongresspersonSkeleton } from '@/components/app/userActionFormCallCongressperson/skeleton'
import { useApiResponseForUserFullProfileInfo } from '@/hooks/useApiResponseForUserFullProfileInfo'
import { useIntlUrls } from '@/hooks/useIntlUrls'
import { useParseRnQueryParam } from '@/hooks/useRnQueryParams'

function UserActionFormCallCongresspersonDeeplinkWrapperContent() {
  const fetchUser = useApiResponseForUserFullProfileInfo()
  const urls = useIntlUrls()
  const router = useRouter()
  const { user } = fetchUser.data || { user: null }
  const { address: rnAddress, loading: loadingRnQueryParam } = useParseRnQueryParam()

  return fetchUser.isLoading || loadingRnQueryParam ? (
    <UserActionFormCallCongresspersonSkeleton />
  ) : (
    <UserActionFormCallCongressperson
      onClose={() => router.push(urls.home())}
      rnAddress={rnAddress}
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
