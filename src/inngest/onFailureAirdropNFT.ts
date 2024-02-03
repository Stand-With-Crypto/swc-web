import { FailureEventArgs } from 'inngest'
import * as Sentry from '@sentry/nextjs'
import { $Enums } from '@prisma/client'
import NFTMintStatus = $Enums.NFTMintStatus
import { AirdropPayload } from '@/utils/server/nft/payload'
import { updateMintNFTStatus } from '@/utils/server/nft/updateMintNFTStatus'

export async function onFailureAirdropNFT(failureEventArgs: FailureEventArgs) {
  Sentry.captureException(failureEventArgs.error, {
    level: 'error',
    tags: {
      functionId: failureEventArgs.event.data.function_id,
    },
  })

  const payload = failureEventArgs.event.data.event.data as AirdropPayload
  await updateMintNFTStatus(payload.nftMintId, NFTMintStatus.FAILED, null, null)
}
