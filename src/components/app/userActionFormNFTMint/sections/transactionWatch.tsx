'use client'

import React from 'react'
import { UserActionType } from '@prisma/client'
import * as Sentry from '@sentry/nextjs'

import {
  actionCreateUserActionMintNFT,
  CreateActionMintNFTInput,
} from '@/actions/actionCreateUserActionNFTMint'
import {
  NFTDisplay,
  NFTDisplaySkeleton,
  UserActionFormLayout,
} from '@/components/app/userActionFormCommon'
import { MINT_NFT_CONTRACT_ADDRESS } from '@/components/app/userActionFormNFTMint/constants'
import {
  UserActionFormSuccessScreenNextAction,
  UserActionFormSuccessScreenNextActionSkeleton,
} from '@/components/app/userActionFormSuccessScreen/userActionFormSuccessScreenNextAction'
import { PageSubTitle } from '@/components/ui/pageSubTitle'
import { PageTitle } from '@/components/ui/pageTitleText'
import { Skeleton } from '@/components/ui/skeleton'
import { useApiResponseForUserPerformedUserActionTypes } from '@/hooks/useApiResponseForUserPerformedUserActionTypes'
import { useEffectOnce } from '@/hooks/useEffectOnce'
import { TransactionResponse } from '@/hooks/useSendMintNFTTransaction'
import { useThirdwebContractMetadata } from '@/hooks/useThirdwebContractMetadata'
import { UserActionNftMintCampaignName } from '@/utils/shared/userActionCampaigns'
import { triggerServerActionForForm } from '@/utils/web/formUtils'
import { identifyUserOnClient } from '@/utils/web/identifyUser'
import { toastGenericError } from '@/utils/web/toastUtils'

export type UserActionFormNFTMintTransactionWatchProps =
  | {
      debug: true
      sendTransactionResponse: null
    }
  | {
      debug?: false
      sendTransactionResponse: TransactionResponse
    }

export function UserActionFormNFTMintTransactionWatch({
  sendTransactionResponse,
  debug,
}: UserActionFormNFTMintTransactionWatchProps) {
  const { data: contractMetadata, isLoading: isLoadingContractMetadata } =
    useThirdwebContractMetadata(MINT_NFT_CONTRACT_ADDRESS)
  const { data: performedUserActionTypesResponse } = useApiResponseForUserPerformedUserActionTypes()

  const [isMined, setIsMined] = React.useState(false)

  const createAction = async (transaction: TransactionResponse) => {
    const input: CreateActionMintNFTInput = {
      campaignName: UserActionNftMintCampaignName.DEFAULT,
      transactionHash: transaction.hash as `0x${string}`,
    }

    return await triggerServerActionForForm(
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
        actionCreateUserActionMintNFT(payload).then(actionResult => {
          if (actionResult.user) {
            identifyUserOnClient(actionResult.user)
          }
          return actionResult
        }),
    )
  }

  useEffectOnce(() => {
    if (debug) {
      setIsMined(true)
      return
    }

    Promise.all([sendTransactionResponse.wait(), createAction(sendTransactionResponse)])
      .catch(err => Sentry.captureException(err, { tags: { domain: 'nftMint/transactionWatch' } }))
      .finally(() => setIsMined(true))
  })

  if (!contractMetadata || isLoadingContractMetadata) {
    return <UserActionFormNFTMintTransactionWatchSkeleton />
  }

  return (
    <UserActionFormLayout>
      <UserActionFormLayout.Container>
        <div className="my-10 flex flex-col items-center gap-6 text-center">
          <NFTDisplay
            alt={contractMetadata.name}
            loading={!isMined}
            raw
            src={contractMetadata.image ?? ''}
          />

          <PageTitle size="sm">
            {isMined ? 'Transaction complete' : 'Transaction in progress...'}
          </PageTitle>

          <PageSubTitle size="md">
            {isMined
              ? "You've done your part to save crypto, but the fight isn't over yet. Keep the momentum going by completing the next action below."
              : 'It may take up to 5 minutes.'}
          </PageSubTitle>
        </div>

        <UserActionFormSuccessScreenNextAction data={performedUserActionTypesResponse} />
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
            <PageTitle size="sm">Transaction complete</PageTitle>
          </Skeleton>

          <Skeleton>
            <PageSubTitle size="md">
              You've done your part to save crypto, but the fight isn't over yet. Keep the momentum
              going by completing the next action below.
            </PageSubTitle>
          </Skeleton>
        </div>

        <UserActionFormSuccessScreenNextActionSkeleton />
      </UserActionFormLayout.Container>
    </UserActionFormLayout>
  )
}
