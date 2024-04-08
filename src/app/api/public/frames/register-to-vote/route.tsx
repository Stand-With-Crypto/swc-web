import {
  FrameMetadataType,
  FrameRequest,
  getFrameHtmlResponse,
  getFrameMessage,
} from '@coinbase/onchainkit/frame'
import { NextRequest, NextResponse } from 'next/server'

import { REGISTRATION_URLS_BY_STATE } from '@/components/app/userActionFormVoterRegistration/constants'
import { getLogger } from '@/utils/shared/logger'
import { requiredEnv } from '@/utils/shared/requiredEnv'
import { fullUrl } from '@/utils/shared/urls'
import { USStateCode } from '@/utils/shared/usStateUtils'

const BASE_CHAIN_ID = '8453'

export const dynamic = 'force-dynamic'

const I_AM_A_VOTER_NFT_CONTRACT_ADDRESS = requiredEnv(
  process.env.I_AM_A_VOTER_NFT_CONTRACT_ADDRESS,
  'I_AM_A_VOTER_NFT_CONTRACT_ADDRESS',
)

const frameData = [
  {
    input: {
      text: 'Enter your email address',
    },
    buttons: [
      {
        label: `View Privacy Policy`,
        action: 'link',
        target: 'https://www.standwithcrypto.org/privacy',
      },
      {
        label: `Next →`,
      },
    ],
    image: {
      src: fullUrl('/api/public/frames/register-to-vote/image/1'),
    },
    postUrl: fullUrl('/api/public/frames/register-to-vote?frame=1'),
  },
  {
    input: {
      text: 'Enter your phone (XXX-XXX-XXXX)',
    },
    buttons: [
      {
        label: `View Privacy Policy`,
        action: 'link',
        target: 'https://www.standwithcrypto.org/privacy',
      },
      {
        label: `Next →`,
      },
    ],
    image: {
      src: fullUrl('/api/public/frames/register-to-vote/image/2'),
    },
    postUrl: fullUrl('/api/public/frames/register-to-vote?frame=2'),
  },
  {
    buttons: [
      {
        label: 'Yes',
      },
      {
        label: 'No',
      },
      {
        label: `I'm not sure`,
      },
    ],
    image: {
      src: fullUrl('/api/public/frames/register-to-vote/image/3'),
    },
    postUrl: fullUrl('/api/public/frames/register-to-vote?frame=3'),
  },
  {
    input: {
      text: 'Enter your state code (e.g. CA)',
    },
    buttons: [
      {
        label: 'Next →',
      },
    ],
    image: {
      src: fullUrl('/api/public/frames/register-to-vote/image/4'),
    },
    postUrl: fullUrl('/api/public/frames/register-to-vote?frame=4'),
  },
  {
    buttons: [
      {
        label: 'Register to vote',
        action: 'link',
        target: 'https://www.usa.gov/register-to-vote',
      },
      {
        label: 'Next →',
      },
    ],
    image: {
      src: fullUrl('/api/public/frames/register-to-vote/image/5'),
    },
    postUrl: fullUrl('/api/public/frames/register-to-vote?frame=5'),
  },
  {
    input: {
      text: 'Enter your state code (e.g. CA)',
    },
    buttons: [
      {
        label: 'Next →',
      },
    ],
    image: {
      src: fullUrl('/api/public/frames/register-to-vote/image/6'),
    },
    postUrl: fullUrl('/api/public/frames/register-to-vote?frame=6'),
  },
  {
    buttons: [
      {
        label: 'Check your voter registration',
        action: 'link',
        target: 'https://www.usa.gov/register-to-vote',
      },
      {
        label: 'Next →',
      },
    ],
    image: {
      src: fullUrl('/api/public/frames/register-to-vote/image/7'),
    },
    postUrl: fullUrl('/api/public/frames/register-to-vote?frame=7'),
  },
  {
    buttons: [
      {
        label: `Mint`,
        action: 'mint',
        target: `eip155:${BASE_CHAIN_ID}:${I_AM_A_VOTER_NFT_CONTRACT_ADDRESS}:1`,
      },
    ],
    image: {
      src: fullUrl('/api/public/frames/register-to-vote/image/8'),
    },
    postUrl: fullUrl('/api/public/frames/register-to-vote?frame=8'),
  },
  {
    image: {
      src: fullUrl('/api/public/frames/register-to-vote/image/9'),
    },
    postUrl: fullUrl('/api/public/frames/register-to-vote?frame=9'),
  },
] as FrameMetadataType[]

const logger = getLogger('framesRegisterToVote')

export async function POST(req: NextRequest): Promise<Response> {
  const url = new URL(req.url)
  const queryParams = url.searchParams
  const frameIndex = Number(queryParams.get('frame'))

  const body: FrameRequest = (await req.json()) as FrameRequest
  try {
    logger.info('trusted data message bytes', body.trustedData.messageBytes)
    const { isValid, message } = await getFrameMessage(body, { neynarApiKey: 'NEYNAR_ONCHAIN_KIT' })
    if (!isValid) {
      logger.error('frame message is not valid')
    } else {
      logger.info('frame message', message)
      const trustedInputText = message.input || ''
      let state = {
        emailAddress: '',
        phoneNumber: '',
      }
      logger.info('raw message state:', message.raw.action.state.serialized)
      logger.info('raw input', message.input)
      logger.info(
        'decodeURIComponent(message.state?.serialized)',
        decodeURIComponent(message.state?.serialized),
      )
      if (message.state?.serialized) {
        logger.info(
          'JSON.parse(decodeURIComponent(message.state?.serialized))',
          JSON.parse(decodeURIComponent(message.state?.serialized)),
        )
        state = JSON.parse(decodeURIComponent(message.state?.serialized)) as {
          emailAddress: string
          phoneNumber: string
        }
        logger.info('trusted input text', trustedInputText)
        logger.info('trusted state', state)
      }
    }
  } catch (e) {
    logger.error('error getting frame message', e)
  }

  const buttonIndex = body.untrustedData?.buttonIndex
  const stateInput = body.untrustedData?.inputText as USStateCode

  // Debugging logs
  logger.info('FID', body.untrustedData?.fid)
  logger.info('untrusted input', body.untrustedData?.inputText)

  let link: string | undefined

  switch (frameIndex) {
    case 0: // Intro screen.
      return new NextResponse(
        getFrameHtmlResponse({
          ...frameData[frameIndex],
          state: {
            emailAddress: '',
            phoneNumber: '',
          },
        }),
      )
    case 1: // Email input screen.
      return new NextResponse(
        getFrameHtmlResponse({
          ...frameData[frameIndex],
          state: { emailAddress: body.untrustedData?.inputText, phoneNumber: '' },
        }),
      )
    case 2: // Email input and phone number input screen.
      // TODO: Determine if it's possible to tie email <> phone number together across frames.
      // Why is it necessary to tie the two fields across frames?
      // - Each frame can only have one text field, so we cannot gather email and phone number within the same frame.
      // - `getUserSessionId` doesn't seem to work as there no SWC user cookies for the frame.
      // - Attempting to store the email address within the next frame's state does not work.
      // Ideas:
      // - We will have the user's FID, so we store that in the database to tie the two fields together.
      logger.info('untrusted frame state', body.untrustedData.state)
      return new NextResponse(getFrameHtmlResponse(frameData[frameIndex]))
    case 3: // "Are you registered to vote" screen.
      switch (buttonIndex) {
        case 1:
          return new NextResponse(getFrameHtmlResponse(frameData[7])) // Mint screen.
        case 2:
          return new NextResponse(getFrameHtmlResponse(frameData[3])) // Register state screen.
        case 3:
          return new NextResponse(getFrameHtmlResponse(frameData[5])) // Check registration screen.
      }
      break
    case 4: // Register state screen.
      link =
        stateInput && REGISTRATION_URLS_BY_STATE[stateInput]
          ? REGISTRATION_URLS_BY_STATE[stateInput]['registerUrl']
          : undefined
      if (!link) return new NextResponse(getFrameHtmlResponse(frameData[frameIndex - 1])) // Same screen.
      return new NextResponse(
        getFrameHtmlResponse({
          ...frameData[frameIndex],
          buttons: [
            { ...frameData[frameIndex].buttons![0], target: link },
            frameData[frameIndex].buttons![1],
          ],
        }),
      ) // Registration screen with respective link.
    case 5: // Register screen.
      return new NextResponse(getFrameHtmlResponse(frameData[7])) // Mint screen.
    case 6: // Check registration state screen.
      link =
        stateInput && REGISTRATION_URLS_BY_STATE[stateInput]
          ? REGISTRATION_URLS_BY_STATE[stateInput]['checkRegistrationUrl']
          : undefined
      if (!link) return new NextResponse(getFrameHtmlResponse(frameData[frameIndex - 1])) // Same screen.
      return new NextResponse(
        getFrameHtmlResponse({
          ...frameData[frameIndex],
          buttons: [
            { ...frameData[frameIndex].buttons![0], target: link },
            frameData[frameIndex].buttons![1],
          ],
        }),
      ) // Registration screen with respective link.
    case 7: // Check registration screen.
      return new NextResponse(getFrameHtmlResponse(frameData[7])) // Mint screen.
    case 8: // Mint screen.
      // TODO: Going to the final screen doesn't work, figure this out.
      return new NextResponse(getFrameHtmlResponse(frameData[frameIndex])) // Final screen.
  }

  return new NextResponse(getFrameHtmlResponse(frameData[Number(frameIndex)]))
}
