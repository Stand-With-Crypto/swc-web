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
  const parsedState = state.toUpperCase()

  const tweetLink = createTweetLink({
    url: 'https://standwithcrypto.org',
    message: `Thank you ${getUSStateNameFromStateCode(state)} for dropping the case against @coinbase. Now ${parsedState} users can stake their crypto! We deserve the right to utilize our assets and we are securing that right.\n\nJoin me in applauding ${parsedState} for a job well done: https://standwithcrypto.org/tweet/case-dismissed/${state}\n\n`,
  })
  return NextResponse.redirect(tweetLink)
}
