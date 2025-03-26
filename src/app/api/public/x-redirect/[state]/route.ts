import 'server-only'

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

import { getUSStateNameFromStateCode } from '@/utils/shared/usStateUtils'
import { createTweetLink } from '@/utils/web/createTweetLink'

const zodParams = z.object({
  state: z.string().length(2),
})

export async function GET(_: NextRequest, props: { params: Promise<{ state: string }> }) {
  const params = await props.params
  const { state } = zodParams.parse(params)

  const tweetLink = createTweetLink({
    url: 'https://standwithcrypto.org',
    message: `${getUSStateNameFromStateCode(state)} just scored a HUGE win for crypto! The state is dropping its staking case against Coinbase, which means people in the state can soon stake their crypto freely. Click here to applaud ${state.toUpperCase()} for a job well done: https://standwithcrypto.org/tweet/case-dismissed/${state}\n\n`,
  })
  return NextResponse.redirect(tweetLink)
}
