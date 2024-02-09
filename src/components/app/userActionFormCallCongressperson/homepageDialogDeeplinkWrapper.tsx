'use client'

import { UserActionFormCallCongressperson } from '@/components/app/userActionFormCallCongressperson'
import { UserActionFormCallCongresspersonSkeleton } from '@/components/app/userActionFormCallCongressperson/skeleton'
import { useApiResponseForUserFullProfileInfo } from '@/hooks/useApiResponseForUserFullProfileInfo'
import { useIntlUrls } from '@/hooks/useIntlUrls'
import { useRouter } from 'next/navigation'

export function UserActionFormCallCongresspersonDeeplinkWrapper() {
  const fetchUser = useApiResponseForUserFullProfileInfo()
  const urls = useIntlUrls()
  const router = useRouter()
  const { user } = fetchUser.data || { user: null }
  return fetchUser.isLoading ? (
    <UserActionFormCallCongresspersonSkeleton />
  ) : (
    <UserActionFormCallCongressperson onClose={() => router.push(urls.home())} user={user} />
  )
}
