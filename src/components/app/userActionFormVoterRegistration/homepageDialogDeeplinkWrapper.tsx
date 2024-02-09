'use client'

import { useRouter } from 'next/navigation'

import { UserActionFormVoterRegistration } from '@/components/app/userActionFormVoterRegistration'
import { UserActionFormVoterRegistrationSkeleton } from '@/components/app/userActionFormVoterRegistration/skeleton'
import { useApiResponseForUserFullProfileInfo } from '@/hooks/useApiResponseForUserFullProfileInfo'
import { useIntlUrls } from '@/hooks/useIntlUrls'

export function UserActionFormVoterRegistrationDeeplinkWrapper() {
  const fetchUser = useApiResponseForUserFullProfileInfo()
  const urls = useIntlUrls()
  const router = useRouter()

  return fetchUser.isLoading ? (
    <UserActionFormVoterRegistrationSkeleton />
  ) : (
    <UserActionFormVoterRegistration onClose={() => router.replace(urls.home())} />
  )
}
