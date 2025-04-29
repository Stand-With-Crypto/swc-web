'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

import { GeoGate } from '@/components/app/geoGate'
import { UserActionFormActionUnavailable } from '@/components/app/userActionFormCommon/actionUnavailable'
import { UserActionFormFollowLinkedIn } from '@/components/app/userActionFormFollowOnLinkedIn'
import { ANALYTICS_NAME_USER_ACTION_FORM_FOLLOW_LINKEDIN } from '@/components/app/userActionFormFollowOnLinkedIn/common/constants'
import { trackDialogOpen } from '@/components/ui/dialog/trackDialogOpen'
import { useIntlUrls } from '@/hooks/useIntlUrls'
import { usePreventOverscroll } from '@/hooks/usePreventOverscroll'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'

export function UserActionFormFollowLinkedInDeeplinkWrapper({
  countryCode,
}: {
  countryCode: SupportedCountryCodes
}) {
  usePreventOverscroll()

  const urls = useIntlUrls()
  const router = useRouter()
  useEffect(() => {
    trackDialogOpen({ open: true, analytics: ANALYTICS_NAME_USER_ACTION_FORM_FOLLOW_LINKEDIN })
  }, [])

  return (
    <GeoGate
      countryCode={countryCode}
      unavailableContent={<UserActionFormActionUnavailable countryCode={countryCode} />}
    >
      <UserActionFormFollowLinkedIn
        countryCode={countryCode}
        onClose={() => router.replace(urls.home())}
      />
    </GeoGate>
  )
}
