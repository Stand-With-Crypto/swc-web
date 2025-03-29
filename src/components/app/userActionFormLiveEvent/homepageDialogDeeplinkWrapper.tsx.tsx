'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

import { GeoGate } from '@/components/app/geoGate'
import { UserActionFormActionUnavailable } from '@/components/app/userActionFormCommon/actionUnavailable'
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
import { DEFAULT_SUPPORTED_COUNTRY_CODE } from '@/utils/shared/supportedCountries'

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
    <GeoGate
      countryCode={DEFAULT_SUPPORTED_COUNTRY_CODE}
      unavailableContent={
        <UserActionFormActionUnavailable countryCode={DEFAULT_SUPPORTED_COUNTRY_CODE} />
      }
    >
      <UserActionFormLiveEvent
        isLoggedIn={isLoggedIn}
        onClose={() => router.replace(urls.home())}
        slug={slug}
      />
    </GeoGate>
  )
}
