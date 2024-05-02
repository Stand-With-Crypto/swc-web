'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

import { UserActionFormPizzaDayLiveEvent } from '@/components/app/userActionFormLiveEventPizzaDay'
import { ANALYTICS_NAME_USER_ACTION_FORM_LIVE_EVENT } from '@/components/app/userActionFormLiveEventPizzaDay/constants'
import { UserActionFormLiveEventSkeleton } from '@/components/app/userActionFormLiveEventPizzaDay/skeleton'
import { trackDialogOpen } from '@/components/ui/dialog/trackDialogOpen'
import { useIntlUrls } from '@/hooks/useIntlUrls'
import { usePreventOverscroll } from '@/hooks/usePreventOverscroll'
import { useSession } from '@/hooks/useSession'
import { UserActionLiveEventCampaignName } from '@/utils/shared/userActionCampaigns'

export function UserActionFormPizzaDayLiveEventDeeplinkWrapper() {
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
    <UserActionFormPizzaDayLiveEvent
      isLoggedIn={isLoggedIn}
      onClose={() => router.replace(urls.home())}
      slug={UserActionLiveEventCampaignName['2024_05_22_PIZZA_DAY']}
    />
  )
}
