'use client'

import { useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'

import { GeoGate } from '@/components/app/geoGate'
import { UserActionFormActionUnavailable } from '@/components/app/userActionFormCommon/actionUnavailable'
import { getUserActionFormRefer } from '@/components/app/userActionFormRefer'
import { ANALYTICS_NAME_USER_ACTION_FORM_REFER } from '@/components/app/userActionFormRefer/common/constants'
import { trackDialogOpen } from '@/components/ui/dialog/trackDialogOpen'
import { useIntlUrls } from '@/hooks/useIntlUrls'
import { usePreventOverscroll } from '@/hooks/usePreventOverscroll'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'

export function UserActionFormReferDeeplinkWrapper({
  countryCode,
}: {
  countryCode: SupportedCountryCodes
}) {
  usePreventOverscroll()

  const router = useRouter()
  const urls = useIntlUrls()

  useEffect(() => {
    trackDialogOpen({ open: true, analytics: ANALYTICS_NAME_USER_ACTION_FORM_REFER })
  }, [])

  const UserActionFormRefer = useMemo(() => getUserActionFormRefer({ countryCode }), [countryCode])

  return (
    <GeoGate
      countryCode={countryCode}
      unavailableContent={<UserActionFormActionUnavailable countryCode={countryCode} />}
    >
      <UserActionFormRefer countryCode={countryCode} onClose={() => router.replace(urls.home())} />
    </GeoGate>
  )
}
