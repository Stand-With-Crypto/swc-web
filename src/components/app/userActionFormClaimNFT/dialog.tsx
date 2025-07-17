'use client'

import dynamic from 'next/dynamic'

import { ANALYTICS_NAME_USER_ACTION_FORM_CLAIM_NFT } from '@/components/app/userActionFormClaimNFT/common/constants'
import { UserActionFormDialog } from '@/components/app/userActionFormCommon/dialog'
import { useDialog } from '@/hooks/useDialog'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { NFTSlug } from '@/utils/shared/nft'
import { Suspense } from 'react'
import { UserActionFormClaimNFTSkeleton } from '@/components/app/userActionFormClaimNFT/common/skeleton'

const UserActionFormClaimNFT = dynamic(() =>
  import('@/components/app/userActionFormClaimNFT').then(mod => mod.UserActionFormClaimNFT),
)

export function UserActionFormClaimNFTDialog({
  children,
  defaultOpen = false,
  countryCode,
  nftSlug,
}: {
  children: React.ReactNode
  defaultOpen?: boolean
  countryCode: SupportedCountryCodes
  nftSlug: NFTSlug
}) {
  const dialogProps = useDialog({
    initialOpen: defaultOpen,
    analytics: ANALYTICS_NAME_USER_ACTION_FORM_CLAIM_NFT,
  })

  return (
    <UserActionFormDialog {...dialogProps} countryCode={countryCode} trigger={children}>
      <Suspense fallback={<UserActionFormClaimNFTSkeleton nftSlug={nftSlug} />}>
        <UserActionFormClaimNFT
          countryCode={countryCode}
          nftSlug={nftSlug}
          onFinished={() => dialogProps.onOpenChange(false)}
        />
      </Suspense>
    </UserActionFormDialog>
  )
}
