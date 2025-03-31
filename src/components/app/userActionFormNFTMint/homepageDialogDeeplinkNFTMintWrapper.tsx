'use client'

import { useRouter } from 'next/navigation'

import { GeoGate } from '@/components/app/geoGate'
import { UserActionFormActionUnavailable } from '@/components/app/userActionFormCommon/actionUnavailable'
import { UserActionFormNFTMint } from '@/components/app/userActionFormNFTMint'
import { useIntlUrls } from '@/hooks/useIntlUrls'
import { usePreventOverscroll } from '@/hooks/usePreventOverscroll'
import { DEFAULT_SUPPORTED_COUNTRY_CODE } from '@/utils/shared/supportedCountries'

export function HomepageDialogDeeplinkNFTMintWrapper() {
  usePreventOverscroll()

  const router = useRouter()
  const urls = useIntlUrls()

  return (
    <GeoGate
      countryCode={DEFAULT_SUPPORTED_COUNTRY_CODE}
      unavailableContent={
        <UserActionFormActionUnavailable countryCode={DEFAULT_SUPPORTED_COUNTRY_CODE} />
      }
    >
      <UserActionFormNFTMint onFinished={() => router.replace(urls.home())} trackMount />
    </GeoGate>
  )
}
