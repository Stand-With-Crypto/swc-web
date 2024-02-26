'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

import { UserActionFormVoterRegistration } from '@/components/app/userActionFormVoterRegistration'
import { ANALYTICS_NAME_USER_ACTION_FORM_VOTER_REGISTRATION } from '@/components/app/userActionFormVoterRegistration/constants'
import { trackDialogOpen } from '@/components/ui/dialog/trackDialogOpen'
import { useIntlUrls } from '@/hooks/useIntlUrls'

export function UserActionFormVoterRegistrationDeeplinkWrapper() {
  const urls = useIntlUrls()
  const router = useRouter()
  useEffect(() => {
    trackDialogOpen({ open: true, analytics: ANALYTICS_NAME_USER_ACTION_FORM_VOTER_REGISTRATION })
  }, [])

  return <UserActionFormVoterRegistration onClose={() => router.replace(urls.home())} />
}
