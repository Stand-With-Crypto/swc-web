import { $Enums } from '@prisma/client'
import * as Sentry from '@sentry/nextjs'
import { FailureEventArgs } from 'inngest'

import { AirdropPayload } from '@/utils/server/nft/payload'
import { updateMintNFTStatus } from '@/utils/server/nft/updateMintNFTStatus'
import NFTMintStatus = $Enums.NFTMintStatus

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
