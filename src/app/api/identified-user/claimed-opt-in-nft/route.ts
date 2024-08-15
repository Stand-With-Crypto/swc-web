import 'server-only'

import { NextResponse } from 'next/server'

import { getMaybeUserAndMethodOfMatchWithMaybeSession } from '@/utils/server/getMaybeUserAndMethodOfMatch'
import { getOptInUserAction } from '@/utils/server/nft/claimOptInNft'
import { withUserSession } from '@/utils/server/serverWrappers/withUserSession'

export const dynamic = 'force-dynamic'

async function apiResponseForUserClaimedOptInNft() {
  const { user } = await getMaybeUserAndMethodOfMatchWithMaybeSession()
  if (!user) return false

  const response = await getOptInUserAction(user?.id)
  return response.nftMintId !== null
}

export type GetUserClaimedOptInNft = Awaited<ReturnType<typeof apiResponseForUserClaimedOptInNft>>

export const GET = withUserSession(async () => {
  const response = await apiResponseForUserClaimedOptInNft()
  return NextResponse.json(response)
})
