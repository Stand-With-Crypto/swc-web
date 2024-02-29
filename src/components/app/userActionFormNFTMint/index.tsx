'use client'

import React, { useEffect } from 'react'
import { capitalize } from 'lodash-es'
import { toast } from 'sonner'

import {
  ANALYTICS_NAME_USER_ACTION_FORM_NFT_MINT,
  MINT_NFT_CONTRACT_ADDRESS,
  UserActionFormNFTMintSectionNames,
} from '@/components/app/userActionFormNFTMint/constants'
import { Checkbox } from '@/components/ui/checkbox'
import { trackDialogOpen } from '@/components/ui/dialog/trackDialogOpen'
import { useSections } from '@/hooks/useSections'
import { useSendMintNFTTransaction } from '@/hooks/useSendMintNFTTransaction'
import { NEXT_PUBLIC_ENVIRONMENT } from '@/utils/shared/sharedEnv'
import { toastGenericError } from '@/utils/web/toastUtils'

import { UserActionFormNFTMintCheckout } from './sections/checkout'
import { UserActionFormNFTMintIntro } from './sections/intro'
import {
  UserActionFormNFTMintTransactionWatch,
  UserActionFormNFTMintTransactionWatchProps,
  UserActionFormNFTMintTransactionWatchSkeleton,
} from './sections/transactionWatch'
import { useCheckoutController } from './useCheckoutController'

export function UserActionFormNFTMint({ trackMount }: { trackMount?: boolean }) {
  const sectionProps = useSections({
    sections: Object.values(UserActionFormNFTMintSectionNames),
    // TODO revert
    initialSectionId: UserActionFormNFTMintSectionNames.TRANSACTION_WATCH,
    analyticsName: ANALYTICS_NAME_USER_ACTION_FORM_NFT_MINT,
  })
  useEffect(() => {
    if (trackMount) {
      trackDialogOpen({ open: true, analytics: ANALYTICS_NAME_USER_ACTION_FORM_NFT_MINT })
    }
  }, [trackMount])

  const checkoutController = useCheckoutController()

  const [isUSResident, setIsUSResident] = React.useState(false)
  // TODO revert
  const [isDebug, setIsDebug] = React.useState(true)

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

    case UserActionFormNFTMintSectionNames.CHECKOUT: {
      const hasEnvironmentBar = NEXT_PUBLIC_ENVIRONMENT !== 'production'

      return (
        <>
          {hasEnvironmentBar && (
            <div className="flex h-10 items-center bg-yellow-300 text-center">
              <div className="container flex justify-between">
                <p className="flex-shrink-0 font-bold">
                  {capitalize(NEXT_PUBLIC_ENVIRONMENT.toLowerCase())} Environment
                </p>
                <label className="flex cursor-pointer items-center gap-2">
                  <Checkbox checked={isDebug} onCheckedChange={val => setIsDebug(val as boolean)} />
                  <p className="leading-4">Mock the minting transaction</p>
                </label>
              </div>
            </div>
          )}
          <UserActionFormNFTMintCheckout
            {...sectionProps}
            {...checkoutController}
            debug={isDebug}
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
        </>
      )
    }

    case UserActionFormNFTMintSectionNames.TRANSACTION_WATCH: {
      if (sendTransactionResponse || isDebug) {
        const params: UserActionFormNFTMintTransactionWatchProps = sendTransactionResponse
          ? { sendTransactionResponse }
          : { debug: true, sendTransactionResponse: null }
        return <UserActionFormNFTMintTransactionWatch {...params} />
      }

      return <UserActionFormNFTMintTransactionWatchSkeleton />
    }

    default:
      sectionProps.onSectionNotFound()
      return null
  }
}
