'use client'

import { useRouter } from 'next/navigation'

import { UserActionFormVoterRegistration } from '@/components/app/userActionFormVoterRegistration'
import { useIntlUrls } from '@/hooks/useIntlUrls'

export function UserActionFormVoterRegistrationDeeplinkWrapper() {
  const urls = useIntlUrls()
  const router = useRouter()

  return <UserActionFormVoterRegistration onClose={() => router.replace(urls.home())} />
}
