'use client'

import { UserActionFormVoterRegistrationNft } from '@/components/app/userActionFormVoterRegistrationNft'
import { UserActionFormVoterRegistrationNftSkeleton } from '@/components/app/userActionFormVoterRegistrationNft/skeleton'
import { useApiResponseForUserFullProfileInfo } from '@/hooks/useApiResponseForUserFullProfileInfo'
import { useLocale } from '@/hooks/useLocale'
import { getIntlUrls } from '@/utils/shared/urls'
import { useRouter } from 'next/navigation'

export function UserActionFormVoterRegistrationNftDeeplinkWrapper() {
  const fetchUser = useApiResponseForUserFullProfileInfo()
  const router = useRouter()
  const locale = useLocale()
  const urls = getIntlUrls(locale)

  return fetchUser.isLoading ? (
    <UserActionFormVoterRegistrationNftSkeleton />
  ) : (
    <UserActionFormVoterRegistrationNft onClose={() => router.replace(urls.home())} />
  )
}
