'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

import { GeoGate } from '@/components/app/geoGate'
import { UserActionFormActionUnavailable } from '@/components/app/userActionFormCommon/actionUnavailable'
import { UserActionFormShareOnTwitter } from '@/components/app/userActionFormShareOnTwitter'
import { ANALYTICS_NAME_USER_ACTION_FORM_SHARE_ON_TWITTER } from '@/components/app/userActionFormShareOnTwitter/common/constants'
import { trackDialogOpen } from '@/components/ui/dialog/trackDialogOpen'
import { useIntlUrls } from '@/hooks/useIntlUrls'
import { usePreventOverscroll } from '@/hooks/usePreventOverscroll'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'

export function UserActionFormShareOnTwitterDeeplinkWrapper({
  countryCode,
}: {
  countryCode: SupportedCountryCodes
}) {
  usePreventOverscroll()

  const urls = useIntlUrls()
  const router = useRouter()
  useEffect(() => {
    trackDialogOpen({ open: true, analytics: ANALYTICS_NAME_USER_ACTION_FORM_SHARE_ON_TWITTER })
  }, [])

  return (
    <GeoGate countryCode={countryCode} unavailableContent={<UserActionFormActionUnavailable />}>
      <UserActionFormShareOnTwitter
        countryCode={countryCode}
        onClose={() => router.replace(urls.home())}
      />
    </GeoGate>
  )
}
