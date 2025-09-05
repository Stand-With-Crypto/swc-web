'use client'

import { Suspense, useEffect } from 'react'
import { useRouter } from 'next/navigation'

import { GeoGate } from '@/components/app/geoGate'
import { UserActionFormClaimNFT } from '@/components/app/userActionFormClaimNFT'
import { ANALYTICS_NAME_USER_ACTION_FORM_CLAIM_NFT } from '@/components/app/userActionFormClaimNFT/common/constants'
import { UserActionFormClaimNFTSkeleton } from '@/components/app/userActionFormClaimNFT/common/skeleton'
import { UserActionFormActionUnavailable } from '@/components/app/userActionFormCommon/actionUnavailable'
import { trackDialogOpen } from '@/components/ui/dialog/trackDialogOpen'
import { useIntlUrls } from '@/hooks/useIntlUrls'
import { usePreventOverscroll } from '@/hooks/usePreventOverscroll'
import { NFTSlug } from '@/utils/shared/nft'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'

export function UserActionFormClaimNFTDeeplinkWrapper({
  countryCode,
  nftSlug,
}: {
  countryCode: SupportedCountryCodes
  nftSlug: NFTSlug
}) {
  usePreventOverscroll()

  const urls = useIntlUrls()
  const router = useRouter()
  useEffect(() => {
    trackDialogOpen({ open: true, analytics: ANALYTICS_NAME_USER_ACTION_FORM_CLAIM_NFT })
  }, [])

  return (
    <GeoGate
      countryCode={countryCode}
      unavailableContent={<UserActionFormActionUnavailable countryCode={countryCode} />}
    >
      <Suspense fallback={<UserActionFormClaimNFTSkeleton nftSlug={nftSlug} />}>
        <UserActionFormClaimNFT
          countryCode={countryCode}
          nftSlug={nftSlug}
          onFinished={() => router.replace(urls.home())}
        />
      </Suspense>
    </GeoGate>
  )
}
