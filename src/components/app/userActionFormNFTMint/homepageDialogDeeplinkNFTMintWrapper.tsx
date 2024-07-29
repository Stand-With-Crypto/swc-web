'use client'

import { GeoGate } from '@/components/app/geoGate'
import { UserActionFormActionUnavailable } from '@/components/app/userActionFormCommon/actionUnavailable'
import { UserActionFormNFTMint } from '@/components/app/userActionFormNFTMint'
import { usePreventOverscroll } from '@/hooks/usePreventOverscroll'
import { DEFAULT_SUPPORTED_COUNTRY_CODE } from '@/utils/shared/supportedCountries'

export function HomepageDialogDeeplinkNFTMintWrapper() {
  usePreventOverscroll()

  return (
    <GeoGate
      countryCode={DEFAULT_SUPPORTED_COUNTRY_CODE}
      unavailableContent={<UserActionFormActionUnavailable />}
    >
      <UserActionFormNFTMint trackMount />
    </GeoGate>
  )
}
