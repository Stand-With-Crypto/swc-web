import { UserActionType } from '@prisma/client'

import { ACTION_NFT_SLUG } from '@/utils/server/nft/claimNFT'

export const actionsWithNFT = Object.entries(ACTION_NFT_SLUG)
  .filter(([_, record]) => record[Object.keys(record)[0]])
  .map(([key]) => UserActionType[key as keyof typeof UserActionType])
