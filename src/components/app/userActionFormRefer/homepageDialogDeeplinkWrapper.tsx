'use client'

import { useEffect } from 'react'

import { GeoGate } from '@/components/app/geoGate'
import { UserActionFormActionUnavailable } from '@/components/app/userActionFormCommon/actionUnavailable'
import { UserActionFormRefer } from '@/components/app/userActionFormRefer'
import { ANALYTICS_NAME_USER_ACTION_FORM_REFER } from '@/components/app/userActionFormRefer/constants'
import { trackDialogOpen } from '@/components/ui/dialog/trackDialogOpen'
import { usePreventOverscroll } from '@/hooks/usePreventOverscroll'
import { DEFAULT_SUPPORTED_COUNTRY_CODE } from '@/utils/shared/supportedCountries'

export function UserActionFormReferDeeplinkWrapper() {
  usePreventOverscroll()

  useEffect(() => {
    trackDialogOpen({ open: true, analytics: ANALYTICS_NAME_USER_ACTION_FORM_REFER })
  }, [])

  return (
    <GeoGate
      countryCode={DEFAULT_SUPPORTED_COUNTRY_CODE}
      unavailableContent={
        <UserActionFormActionUnavailable countryCode={DEFAULT_SUPPORTED_COUNTRY_CODE} />
      }
    >
      <UserActionFormRefer />
    </GeoGate>
  )
}
