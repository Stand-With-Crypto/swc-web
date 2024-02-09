import { useSections } from '@/hooks/useSections'
import { toast } from 'sonner'
import React from 'react'

import { UserActionFormNFTMintIntro } from './sections/intro'
import { UserActionFormNFTMintCheckout } from './sections/checkout'
import { UserActionFormNFTMintSuccess } from './sections/success'
import { useCheckoutController } from './useCheckoutController'
import { MINT_NFT_CONTRACT_ADDRESS } from '@/components/app/userActionFormNFTMint/constants'
import { useSendMintNFTTransaction } from '@/hooks/useSendMintNFTTransaction'
import { toastGenericError } from '@/utils/web/toastUtils'

export enum UserActionFormNFTMintSectionNames {
  INTRO = 'intro',
  CHECKOUT = 'checkout',
  SUCCESS = 'success',
}
export function UserActionFormNFTMint(_props: { onCancel: () => void; onSuccess: () => void }) {
  const sectionProps = useSections({
    sections: Object.values(UserActionFormNFTMintSectionNames),
    initialSectionId: UserActionFormNFTMintSectionNames.INTRO,
    analyticsName: 'User Action Form NFT Mint',
  })

  const checkoutController = useCheckoutController()

  const { mintNFT, status: _sendNFTTransactionStatus } = useSendMintNFTTransaction({
    contractAddress: MINT_NFT_CONTRACT_ADDRESS,
    quantity: checkoutController.quantity,
    onStatusChange: status => {
      if (status === 'error') {
        return toastGenericError()
      }

      if (status === 'canceled') {
        return toast.error('Transaction canceled')
      }

      if (status === 'completed') {
        sectionProps.goToSection(UserActionFormNFTMintSectionNames.SUCCESS)
      }
    },
  })

  switch (sectionProps.currentSection) {
    case UserActionFormNFTMintSectionNames.INTRO:
      return <UserActionFormNFTMintIntro {...sectionProps} />

    case UserActionFormNFTMintSectionNames.CHECKOUT:
      return (
        <UserActionFormNFTMintCheckout
          {...sectionProps}
          {...checkoutController}
          onMint={async () => {
            await mintNFT()
            sectionProps.goToSection(UserActionFormNFTMintSectionNames.SUCCESS)
          }}
        />
      )

    case UserActionFormNFTMintSectionNames.SUCCESS:
      return (
        <UserActionFormNFTMintSuccess
          {...sectionProps}
          totalFeeDisplay={checkoutController.totalFeeDisplay}
        />
      )

    default:
      sectionProps.onSectionNotFound()
      return null
  }
}
