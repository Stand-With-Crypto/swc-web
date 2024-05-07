'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

import {
  UserActionFormLiveEvent,
  UserActionFormLiveEventProps,
} from '@/components/app/userActionFormLiveEvent'
import { ANALYTICS_NAME_USER_ACTION_FORM_LIVE_EVENT } from '@/components/app/userActionFormLiveEvent/constants'
import { UserActionFormLiveEventSkeleton } from '@/components/app/userActionFormLiveEvent/skeleton'
import { trackDialogOpen } from '@/components/ui/dialog/trackDialogOpen'
import { useIntlUrls } from '@/hooks/useIntlUrls'
import { usePreventOverscroll } from '@/hooks/usePreventOverscroll'
import { useSession } from '@/hooks/useSession'

export function UserActionFormLiveEventDeeplinkWrapper({
  slug,
}: Pick<UserActionFormLiveEventProps, 'slug'>) {
  usePreventOverscroll()

  const urls = useIntlUrls()
  const router = useRouter()
  const session = useSession()
  const { isLoggedIn, isLoading } = session

  useEffect(() => {
    trackDialogOpen({ open: true, analytics: ANALYTICS_NAME_USER_ACTION_FORM_LIVE_EVENT })
  }, [])

  if (isLoading) {
    return <UserActionFormLiveEventSkeleton />
  }

  return (
    <UserActionFormLiveEvent
      isLoggedIn={isLoggedIn}
      onClose={() => router.replace(urls.home())}
      slug={slug}
    />
  )
}
