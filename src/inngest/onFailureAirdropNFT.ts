import { FailureEventArgs } from 'inngest'
import * as Sentry from '@sentry/nextjs'
import { $Enums } from '@prisma/client'
import { updateMinNFTStatus } from '@/utils/server/nft'
import NFTMintStatus = $Enums.NFTMintStatus
import { airdropPayload } from '@/utils/server/nft/payload'

export async function onFailureAirdropNFT(failureEventArgs: FailureEventArgs) {
  Sentry.captureException(failureEventArgs.error, {
    level: 'error',
    tags: {
      functionId: failureEventArgs.event.data.function_id,
    },
  })

  const payload = failureEventArgs.event.data.event.data as airdropPayload
  await updateMinNFTStatus(payload.nftMintId, NFTMintStatus.FAILED, '')
}
