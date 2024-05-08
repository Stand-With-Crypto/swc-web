'use client'

import { useEffect } from 'react'

import { UserActionFormPizzaDayLiveEvent } from '@/components/app/userActionFormLiveEventPizzaDay'
import { ANALYTICS_NAME_USER_ACTION_FORM_PIZZA_DAY_LIVE_EVENT } from '@/components/app/userActionFormLiveEventPizzaDay/constants'
import { UserActionFormLiveEventSkeleton } from '@/components/app/userActionFormLiveEventPizzaDay/skeletons/dialogSkeleton'
import { trackDialogOpen } from '@/components/ui/dialog/trackDialogOpen'
import { usePreventOverscroll } from '@/hooks/usePreventOverscroll'
import { useSession } from '@/hooks/useSession'

export function UserActionFormPizzaDayLiveEventDeeplinkWrapper() {
  usePreventOverscroll()

  const session = useSession()
  const { isLoading } = session

  useEffect(() => {
    trackDialogOpen({ open: true, analytics: ANALYTICS_NAME_USER_ACTION_FORM_PIZZA_DAY_LIVE_EVENT })
  }, [])

  if (isLoading) {
    return <UserActionFormLiveEventSkeleton />
  }

  return <UserActionFormPizzaDayLiveEvent />
}
