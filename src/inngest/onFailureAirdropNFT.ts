import { FailureEventArgs } from 'inngest'
import * as Sentry from '@sentry/nextjs'
import { $Enums, NFTMint } from '@prisma/client'
import { updateMinNFTStatus } from '@/utils/server/nft'
import NFTMintStatus = $Enums.NFTMintStatus

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

export async function onFailureUpdateNFTStatus(failureEventArgs: FailureEventArgs) {
  Sentry.captureException(failureEventArgs.error, {
    level: 'error',
    tags: {
      functionId: failureEventArgs.event.data.function_id,
    },
  })

  const mintNft = failureEventArgs.event.data.event.data.userAction as NFTMint
  await updateMinNFTStatus(mintNft.id, NFTMintStatus.FAILED, '')
}
