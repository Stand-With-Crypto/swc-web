'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

import { GeoGate } from '@/components/app/geoGate'
import { UserActionFormActionUnavailable } from '@/components/app/userActionFormCommon/actionUnavailable'
import { ANALYTICS_NAME_USER_ACTION_FORM_SHARE_ON_TWITTER } from '@/components/app/userActionFormShareOnTwitter/common/constants'
import { UserActionFormShareOnTwitter } from '@/components/app/userActionFormShareOnTwitter/userActionFormShareOnTwitter'
import { trackDialogOpen } from '@/components/ui/dialog/trackDialogOpen'
import { useIntlUrls } from '@/hooks/useIntlUrls'
import { usePreventOverscroll } from '@/hooks/usePreventOverscroll'
import { DEFAULT_SUPPORTED_COUNTRY_CODE } from '@/utils/shared/supportedCountries'

export function UserActionFormShareOnTwitterDeeplinkWrapper() {
  usePreventOverscroll()

  const urls = useIntlUrls()
  const router = useRouter()
  useEffect(() => {
    trackDialogOpen({ open: true, analytics: ANALYTICS_NAME_USER_ACTION_FORM_SHARE_ON_TWITTER })
  }, [])

  return (
    <GeoGate
      countryCode={DEFAULT_SUPPORTED_COUNTRY_CODE}
      unavailableContent={<UserActionFormActionUnavailable />}
    >
      <UserActionFormShareOnTwitter
        countryCode={DEFAULT_SUPPORTED_COUNTRY_CODE}
        onClose={() => router.replace(urls.home())}
      />
    </GeoGate>
  )
}
