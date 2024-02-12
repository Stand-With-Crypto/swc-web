import React from 'react'
import { toast } from 'sonner'

import { MINT_NFT_CONTRACT_ADDRESS } from '@/components/app/userActionFormNFTMint/constants'
import { useSections } from '@/hooks/useSections'
import { useSendMintNFTTransaction } from '@/hooks/useSendMintNFTTransaction'
import { toastGenericError } from '@/utils/web/toastUtils'

import { UserActionFormNFTMintCheckout } from './sections/checkout'
import { UserActionFormNFTMintIntro } from './sections/intro'
import {
  UserActionFormNFTMintTransactionWatch,
  UserActionFormNFTMintTransactionWatchSkeleton,
} from './sections/transactionWatch'
import { useCheckoutController } from './useCheckoutController'

export enum UserActionFormNFTMintSectionNames {
  INTRO = 'intro',
  CHECKOUT = 'checkout',
  TRANSACTION_WATCH = 'transactionWatch',
}
export function UserActionFormNFTMint(_props: { onCancel: () => void; onSuccess: () => void }) {
  const sectionProps = useSections({
    sections: Object.values(UserActionFormNFTMintSectionNames),
    initialSectionId: UserActionFormNFTMintSectionNames.INTRO,
    analyticsName: 'User Action Form NFT Mint',
  })

  const checkoutController = useCheckoutController()

  const [isUSResident, setIsUSResident] = React.useState(false)
  const {
    mintNFT,
    status: sendNFTTransactionStatus,
    sendTransactionResponse,
  } = useSendMintNFTTransaction({
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
        sectionProps.goToSection(UserActionFormNFTMintSectionNames.TRANSACTION_WATCH)
      }
    },
    isUSResident,
  })

  switch (sectionProps.currentSection) {
    case UserActionFormNFTMintSectionNames.INTRO:
      return <UserActionFormNFTMintIntro {...sectionProps} />

    case UserActionFormNFTMintSectionNames.CHECKOUT:
      return (
        <UserActionFormNFTMintCheckout
          {...sectionProps}
          {...checkoutController}
          isUSResident={isUSResident}
          mintStatus={sendNFTTransactionStatus}
          onIsUSResidentChange={setIsUSResident}
          onMint={async () => {
            const result = await mintNFT()
            if (result === 'completed') {
              sectionProps.goToSection(UserActionFormNFTMintSectionNames.TRANSACTION_WATCH)
            }
          }}
        />
      )

    case UserActionFormNFTMintSectionNames.TRANSACTION_WATCH: {
      if (!sendTransactionResponse) {
        return <UserActionFormNFTMintTransactionWatchSkeleton />
      }
      return (
        <UserActionFormNFTMintTransactionWatch sendTransactionResponse={sendTransactionResponse} />
      )
    }

    default:
      sectionProps.onSectionNotFound()
      return null
  }
}
