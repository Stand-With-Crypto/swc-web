'use client'

import { UserActionFormCallCongressperson } from '@/components/app/userActionFormCallCongressperson'
import { UserActionFormCallCongresspersonSkeleton } from '@/components/app/userActionFormCallCongressperson/skeleton'
import { useApiResponseForUserFullProfileInfo } from '@/hooks/useApiResponseForUserFullProfileInfo'

export function UserActionFormCallCongresspersonDeeplinkWrapper() {
  const fetchUser = useApiResponseForUserFullProfileInfo()
  const { user } = fetchUser.data || { user: null }
  return fetchUser.isLoading ? (
    <UserActionFormCallCongresspersonSkeleton />
  ) : (
    <UserActionFormCallCongressperson user={user} />
  )
}
