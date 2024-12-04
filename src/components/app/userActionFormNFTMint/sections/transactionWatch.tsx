'use client'

import React, { useCallback, useEffect, useRef } from 'react'
import { UserActionType } from '@prisma/client'
import * as Sentry from '@sentry/nextjs'
import { base } from 'thirdweb/chains'
import { useWaitForReceipt } from 'thirdweb/react'

import {
  actionCreateUserActionMintNFT,
  CreateActionMintNFTInput,
} from '@/actions/actionCreateUserActionNFTMint'
import {
  NFTDisplay,
  NFTDisplaySkeleton,
  UserActionFormLayout,
} from '@/components/app/userActionFormCommon'
import {
  MINT_NFT_CONTRACT_ADDRESS,
  UserActionFormNFTMintSectionNames,
} from '@/components/app/userActionFormNFTMint/constants'
import { Button } from '@/components/ui/button'
import { PageSubTitle } from '@/components/ui/pageSubTitle'
import { PageTitle } from '@/components/ui/pageTitleText'
import { Skeleton } from '@/components/ui/skeleton'
import { useEffectOnce } from '@/hooks/useEffectOnce'
import { UseSectionsReturn } from '@/hooks/useSections'
import { useThirdwebContractMetadata } from '@/hooks/useThirdwebContractMetadata'
import { thirdwebClient } from '@/utils/shared/thirdwebClient'
import { UserActionNftMintCampaignName } from '@/utils/shared/userActionCampaigns'
import { triggerServerActionForForm } from '@/utils/web/formUtils'
import { identifyUserOnClient } from '@/utils/web/identifyUser'
import { toastGenericError } from '@/utils/web/toastUtils'

export type UserActionFormNFTMintTransactionWatchProps = (
  | {
      debug: true
      transactionHash: null
    }
  | {
      debug?: false
      transactionHash: string
    }
) &
  UseSectionsReturn<UserActionFormNFTMintSectionNames>

export function UserActionFormNFTMintTransactionWatch({
  transactionHash,
  debug,
  goToSection,
}: UserActionFormNFTMintTransactionWatchProps) {
  const { data: contractMetadata, isLoading: isLoadingContractMetadata } =
    useThirdwebContractMetadata(MINT_NFT_CONTRACT_ADDRESS)

  const {
    data: receipt,
    isError: receiptVerificationFailed,
    error: receiptError,
    refetch: refetchReceipt,
    isLoading: isReceiptLoading,
  } = useWaitForReceipt({
    transactionHash: transactionHash as `0x${string}`,
    client: thirdwebClient,
    chain: base,
  })

  const createAction = useCallback(() => {
    const input: CreateActionMintNFTInput = {
      campaignName: UserActionNftMintCampaignName.DEFAULT,
      transactionHash: transactionHash as `0x${string}`,
    }

    try {
      void triggerServerActionForForm(
        {
          formName: 'User Action Form NFT Mint',
          onError: toastGenericError,
          analyticsProps: {
            'Campaign Name': input.campaignName,
            'User Action Type': UserActionType.NFT_MINT,
          },
          payload: input,
        },
        payload =>
          actionCreateUserActionMintNFT(payload).then(async actionResultPromise => {
            const actionResult = await actionResultPromise
            if (actionResult && 'user' in actionResult && actionResult.user) {
              identifyUserOnClient(actionResult.user)
            }
            return actionResult
          }),
      ).then(result => {
        if (result.status === 'success') goToSection(UserActionFormNFTMintSectionNames.SUCCESS)
      })
    } catch (err) {
      Sentry.captureException(err, { tags: { domain: 'nftMint/transactionWatch' } })
    }
  }, [goToSection, transactionHash])

  const isTransactionHandled = useRef(false)

  useEffect(() => {
    if (receiptVerificationFailed) {
      Sentry.captureException(receiptError, { tags: { domain: 'nftMint/transactionWatch' } })
      toastGenericError()
    }
  }, [receiptVerificationFailed, receiptError])

  useEffect(() => {
    if (receipt?.status === 'success' && !isTransactionHandled.current) {
      isTransactionHandled.current = true
      createAction()
    }
  }, [createAction, receipt])

  useEffectOnce(() => {
    if (debug) {
      goToSection(UserActionFormNFTMintSectionNames.SUCCESS)
    }
  })

  if (!contractMetadata || isLoadingContractMetadata) {
    return <UserActionFormNFTMintTransactionWatchSkeleton />
  }

  return (
    <UserActionFormLayout>
      <UserActionFormLayout.Container>
        <div className="flex flex-col items-center gap-6 text-center">
          <NFTDisplay
            alt={contractMetadata.name}
            isThirdwebMedia
            loading={isLoadingContractMetadata}
            src={contractMetadata.image ?? ''}
          />

          <PageTitle size="sm">
            {receiptVerificationFailed
              ? 'Transaction verification failed!'
              : 'Transaction in progress...'}
          </PageTitle>

          <PageSubTitle size="md">
            {receiptVerificationFailed
              ? 'It looks like we were unable to verify the NFT mint transaction. Please try again.'
              : 'It may take up to 5 minutes'}
          </PageSubTitle>

          {receiptVerificationFailed && (
            <Button disabled={isReceiptLoading} onClick={() => refetchReceipt()}>
              Verify again
            </Button>
          )}
        </div>
      </UserActionFormLayout.Container>
    </UserActionFormLayout>
  )
}

export function UserActionFormNFTMintTransactionWatchSkeleton() {
  return (
    <UserActionFormLayout>
      <UserActionFormLayout.Container>
        <div className="my-10 flex flex-col items-center gap-6 text-center">
          <NFTDisplaySkeleton />

          <Skeleton>
            <PageTitle size="sm">Transaction in progress</PageTitle>
          </Skeleton>

          <Skeleton>
            <PageSubTitle size="md">It may take up to 5 minutes</PageSubTitle>
          </Skeleton>
        </div>
      </UserActionFormLayout.Container>
    </UserActionFormLayout>
  )
}
