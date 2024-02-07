'use client'

import { UserActionFormVoterRegistration } from '@/components/app/userActionFormVoterRegistration'
import { UserActionFormVoterRegistrationSkeleton } from '@/components/app/userActionFormVoterRegistration/skeleton'
import { useApiResponseForUserFullProfileInfo } from '@/hooks/useApiResponseForUserFullProfileInfo'

export function UserActionFormVoterRegistrationDeeplinkWrapper() {
  const fetchUser = useApiResponseForUserFullProfileInfo()

  return fetchUser.isLoading ? (
    <UserActionFormVoterRegistrationSkeleton />
  ) : (
    <UserActionFormVoterRegistration />
  )
}
