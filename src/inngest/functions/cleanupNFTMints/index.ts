import { inngest } from '@/inngest/inngest'
import { onScriptFailure } from '@/inngest/onScriptFailure'
import { prismaClient } from '@/utils/server/prismaClient'
import { NFTSlug } from '@/utils/shared/nft'

const CLEANUP_NFT_MINTS_FUNCTION_ID = 'script.cleanup-nft-mints'
const CLEANUP_NFT_MINTS_EVENT_NAME = 'script/cleanup.nft.mints'

export type CLEANUP_NFT_MINTS_EVENT_SCHEMA = {
  name: typeof CLEANUP_NFT_MINTS_EVENT_NAME
  data: {
    persist: boolean
  }
}

export const cleanupNFTMintsWithInngest = inngest.createFunction(
  {
    id: CLEANUP_NFT_MINTS_FUNCTION_ID,
    retries: 0,
    onFailure: onScriptFailure,
  },
  { event: CLEANUP_NFT_MINTS_EVENT_NAME },
  async ({ event, step }) => {
    const payload = event.data

    // Get `nft_mint` rows where:
    // - `nft_slug` = 'swc-shield'
    // - `contract_address` = '0x741B334b0690de44Bce6c926a1F74Ca69C95c80c'
    const invalidShieldRows = await step.run('script.get-invalid-shield-nft-mints', async () => {
      return prismaClient.nFTMint.findMany({
        select: {
          id: true,
        },
        where: {
          nftSlug: NFTSlug.SWC_SHIELD,
          contractAddress: '0x741B334b0690de44Bce6c926a1F74Ca69C95c80c',
        },
      })
    })

    let updatedInvalidShieldRows = { count: 0 }
    if (payload.persist) {
      // Update the `nft_slug` to `'stand-with-crypto-supporter'` for the selected rows.
      updatedInvalidShieldRows = await step.run(
        'script.update-invalid-shield-nft-mints',
        async () => {
          return prismaClient.nFTMint.updateMany({
            where: {
              id: {
                in: invalidShieldRows.map(row => row.id),
              },
            },
            data: {
              nftSlug: NFTSlug.STAND_WITH_CRYPTO_SUPPORTER,
            },
          })
        },
      )
    }

    // Get `nft_mint` rows where:
    // - `nft_slug` is in `('swc-shield', 'i-am-a-voter', 'call-representative-sept-11', 'la-crypto-event-2024-03-04')`
    // - `cost_at_mint` is greater than 0
    const mintRows = await step.run('script.get-relevant-nft-mints', async () => {
      return prismaClient.nFTMint.findMany({
        select: {
          id: true,
        },
        where: {
          nftSlug: {
            in: [
              NFTSlug.SWC_SHIELD,
              NFTSlug.I_AM_A_VOTER,
              NFTSlug.CALL_REPRESENTATIVE_SEPT_11,
              NFTSlug.LA_CRYPTO_EVENT_2024_03_04,
            ],
          },
          costAtMint: {
            gt: 0,
          },
        },
      })
    })

    let updatedMintRows = { count: 0 }
    if (payload.persist) {
      // Update the `cost_at_mint` and `cost_at_mint_usd` to 0 for the selected rows.
      updatedMintRows = await step.run('script.update-nft-mints', async () => {
        return prismaClient.nFTMint.updateMany({
          where: {
            id: {
              in: mintRows.map(row => row.id),
            },
          },
          data: {
            costAtMint: 0,
            costAtMintUsd: 0,
          },
        })
      })
    }

    return {
      dryRun: payload.persist,
      mintRowsCount: mintRows.length,
      updatedMintRowsCount: updatedMintRows.count,
      invalidShieldRowsCount: invalidShieldRows.length,
      updatedInvalidShieldRowsCount: updatedInvalidShieldRows.count,
    }
  },
)
