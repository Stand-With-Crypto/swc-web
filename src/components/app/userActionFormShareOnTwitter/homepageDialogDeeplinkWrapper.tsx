'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

import { UserActionFormShareOnTwitter } from '@/components/app/userActionFormShareOnTwitter'
import { ANALYTICS_NAME_USER_ACTION_FORM_SHARE_ON_TWITTER } from '@/components/app/userActionFormShareOnTwitter/constants'
import { trackDialogOpen } from '@/components/ui/dialog/trackDialogOpen'
import { useIntlUrls } from '@/hooks/useIntlUrls'
import { usePreventOverscroll } from '@/hooks/usePreventOverscroll'

export function UserActionFormShareOnTwitterDeeplinkWrapper() {
  usePreventOverscroll()

  const urls = useIntlUrls()
  const router = useRouter()
  useEffect(() => {
    trackDialogOpen({ open: true, analytics: ANALYTICS_NAME_USER_ACTION_FORM_SHARE_ON_TWITTER })
  }, [])

  return <UserActionFormShareOnTwitter onClose={() => router.replace(urls.home())} />
}
