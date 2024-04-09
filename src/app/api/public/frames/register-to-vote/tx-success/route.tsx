import { FrameRequest, getFrameHtmlResponse, getFrameMessage } from '@coinbase/onchainkit/frame'
import { NextRequest, NextResponse } from 'next/server'

import { getLogger } from '@/utils/shared/logger'
import { NEYNAR_API_KEY } from '@/utils/shared/neynarAPIKey'
import { fullUrl } from '@/utils/shared/urls'

const logger = getLogger('framesRegisterToVoteTxSuccess')

export async function POST(req: NextRequest): Promise<Response> {
  const body: FrameRequest = (await req.json()) as FrameRequest
  const { isValid, message } = await getFrameMessage(body, { neynarApiKey: NEYNAR_API_KEY }) // NOTE: Frame state data does not exist on localhost.
  if (!isValid || !message)
    return NextResponse.json({ error: 'invalid frame message' }, { status: 400 })
  let currentFrameState = {
    userId: '',
    sessionId: '',
  }
  if (message.state?.serialized) {
    currentFrameState = JSON.parse(decodeURIComponent(message.state?.serialized)) as {
      userId: string
      sessionId: string
    }
  }

  logger.info('tx id', body.untrustedData?.transactionId)

  return new NextResponse(
    getFrameHtmlResponse({
      buttons: [
        {
          label: 'Go to Stand With Crypto',
          action: 'link',
          target:
            currentFrameState.userId && currentFrameState.sessionId
              ? fullUrl(
                  `?userId=${currentFrameState.userId}&sessionId=${currentFrameState.sessionId}`,
                )
              : fullUrl('/'),
        },
      ],
      image: {
        src: fullUrl('/api/public/frames/register-to-vote/image/9'),
      },
    }),
  )
}
