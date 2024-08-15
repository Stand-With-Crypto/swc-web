import React from 'react'

import { NFTDisplay } from '@/components/app/userActionFormCommon'
import { MINT_NFT_CONTRACT_ADDRESS } from '@/components/app/userActionFormNFTMint/constants'
import { UserActionFormNFTMintTransactionWatchSkeleton } from '@/components/app/userActionFormNFTMint/sections/transactionWatch'
import { USER_ACTION_FORM_SUCCESS_SCREEN_INFO } from '@/components/app/userActionFormSuccessScreen/constants'
import { UserActionFormSuccessScreenFeedback } from '@/components/app/userActionFormSuccessScreen/UserActionFormSuccessScreenFeedback'
import { useThirdwebContractMetadata } from '@/hooks/useThirdwebContractMetadata'

export const UserActionFormNFTMintSuccess = () => {
  const { data: contractMetadata, isLoading: isLoadingContractMetadata } =
    useThirdwebContractMetadata(MINT_NFT_CONTRACT_ADDRESS)

  if (!contractMetadata || isLoadingContractMetadata) {
    return <UserActionFormNFTMintTransactionWatchSkeleton />
  }

  return (
    <UserActionFormSuccessScreenFeedback
      image={
        <NFTDisplay
          alt={contractMetadata.name}
          isThirdwebMedia
          src={contractMetadata.image ?? ''}
        />
      }
      {...USER_ACTION_FORM_SUCCESS_SCREEN_INFO.NFT_MINT}
    />
  )
}
