import React from 'react'

import { NFTDisplay } from '@/components/app/userActionFormCommon'
import { UserActionFormSuccessScreen } from '@/components/app/userActionFormSuccessScreen'
import { USER_ACTION_FORM_SUCCESS_SCREEN_INFO } from '@/components/app/userActionFormSuccessScreen/constants'
import { UserActionFormSuccessScreenFeedback } from '@/components/app/userActionFormSuccessScreen/UserActionFormSuccessScreenFeedback'
import { NFTSlug } from '@/utils/shared/nft'
import { NFT_CLIENT_METADATA } from '@/utils/web/nft'

interface UserActionFormClaimNFTSuccessProps {
  onClose: () => void
  nftSlug: NFTSlug
}

export const UserActionFormClaimNFTSuccess = ({
  onClose,
  nftSlug,
}: UserActionFormClaimNFTSuccessProps) => {
  const contractMetadata = NFT_CLIENT_METADATA[nftSlug]

  return (
    <UserActionFormSuccessScreen onClose={onClose}>
      <UserActionFormSuccessScreenFeedback
        {...USER_ACTION_FORM_SUCCESS_SCREEN_INFO.CLAIM_NFT}
        image={<NFTDisplay alt={contractMetadata.image.alt} raw src={contractMetadata.image.url} />}
      />
    </UserActionFormSuccessScreen>
  )
}
