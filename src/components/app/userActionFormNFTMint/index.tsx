'use client'

import React, { useEffect } from 'react'
import { capitalize } from 'lodash-es'

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
    initialSectionId: UserActionFormNFTMintSectionNames.INTRO,
    analyticsName: ANALYTICS_NAME_USER_ACTION_FORM_NFT_MINT,
  })
  useEffect(() => {
    if (trackMount) {
      trackDialogOpen({ open: true, analytics: ANALYTICS_NAME_USER_ACTION_FORM_NFT_MINT })
    }
  }, [trackMount])

  const checkoutController = useCheckoutController()

  const [isDebug, setIsDebug] = React.useState(false)

  const { prepareTransaction, setTransactionHash, transactionHash, handleTransactionException } =
    useSendMintNFTTransaction({
      contractAddress: MINT_NFT_CONTRACT_ADDRESS,
      quantity: checkoutController.quantity,
    })

  switch (sectionProps.currentSection) {
    case UserActionFormNFTMintSectionNames.INTRO:
      return <UserActionFormNFTMintIntro {...sectionProps} />

    case UserActionFormNFTMintSectionNames.CHECKOUT: {
      const hasEnvironmentBar = NEXT_PUBLIC_ENVIRONMENT !== 'production'

      return (
        <div className="flex h-full flex-col">
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
            handleTransactionException={handleTransactionException}
            prepareTransaction={prepareTransaction}
            setTransactionHash={setTransactionHash}
          />
        </div>
      )
    }

    case UserActionFormNFTMintSectionNames.TRANSACTION_WATCH: {
      if (transactionHash || isDebug) {
        const params: UserActionFormNFTMintTransactionWatchProps = transactionHash
          ? { transactionHash }
          : { debug: true, transactionHash: null }
        return <UserActionFormNFTMintTransactionWatch {...params} />
      }

      return <UserActionFormNFTMintTransactionWatchSkeleton />
    }

    default:
      sectionProps.onSectionNotFound()
      return null
  }
}
