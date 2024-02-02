'use client'

import { UserActionFormCallCongressperson } from '@/components/app/userActionFormCallCongressperson'
import { UserActionFormCallCongresspersonSkeleton } from '@/components/app/userActionFormCallCongressperson/skeleton'
import { useApiResponseForUserFullProfileInfo } from '@/hooks/useApiResponseForUserFullProfileInfo'
import { useIntlUrls } from '@/hooks/useIntlUrls'
import { useParseRnQueryParam } from '@/hooks/useRnQueryParams'
import { useRouter } from 'next/navigation'

export function UserActionFormCallCongresspersonDeeplinkWrapper() {
  const fetchUser = useApiResponseForUserFullProfileInfo()
  const urls = useIntlUrls()
  const router = useRouter()
  const { user } = fetchUser.data || { user: null }
  const { address: rnAddress, loading: loadingRnQueryParam } = useParseRnQueryParam()

  return fetchUser.isLoading || loadingRnQueryParam ? (
    <UserActionFormCallCongresspersonSkeleton />
  ) : (
    <UserActionFormCallCongressperson
      rnAddress={rnAddress}
      user={user}
      onClose={() => router.push(urls.home())}
    />
  )
}
