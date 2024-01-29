import { FailureEventArgs } from 'inngest'
import * as Sentry from '@sentry/nextjs'
import { $Enums, NFTMint } from '@prisma/client'
import NFTMintStatus = $Enums.NFTMintStatus
import { updateMinNFTStatus } from '@/utils/server/airdrop'

export async function onFailureAirdropNFT(failureEventArgs: FailureEventArgs) {
  Sentry.captureException(failureEventArgs.error, {
    level: 'error',
    tags: {
      functionId: failureEventArgs.event.data.function_id,
    },
  })

  const mintNft = failureEventArgs.event.data.event.data.userAction as NFTMint
  await updateMinNFTStatus(mintNft.id, NFTMintStatus.FAILED, '')
}
