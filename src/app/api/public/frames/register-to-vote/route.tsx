import {
  FrameMetadataType,
  FrameRequest,
  getFrameHtmlResponse,
  getFrameMessage,
} from '@coinbase/onchainkit/frame'
import { NextRequest, NextResponse } from 'next/server'
import { SafeParseReturnType } from 'zod'

import { REGISTRATION_URLS_BY_STATE } from '@/components/app/userActionFormVoterRegistration/constants'
import { getLogger } from '@/utils/shared/logger'
import { normalizePhoneNumber } from '@/utils/shared/phoneNumber'
import { requiredEnv } from '@/utils/shared/requiredEnv'
import { fullUrl } from '@/utils/shared/urls'
import { USStateCode } from '@/utils/shared/usStateUtils'
import { zodEmailAddress } from '@/validation/fields/zodEmailAddress'
import { zodPhoneNumber } from '@/validation/fields/zodPhoneNumber'

const BASE_CHAIN_ID = '8453'

export const dynamic = 'force-dynamic'

const I_AM_A_VOTER_NFT_CONTRACT_ADDRESS = requiredEnv(
  process.env.I_AM_A_VOTER_NFT_CONTRACT_ADDRESS,
  'I_AM_A_VOTER_NFT_CONTRACT_ADDRESS',
)

const NEYNAR_API_KEY = 'NEYNAR_ONCHAIN_KIT'
const FRAME_QUERY_PARAMETER = 'frame'

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
  const frameIndex = Number(queryParams.get(FRAME_QUERY_PARAMETER))

  const body: FrameRequest = (await req.json()) as FrameRequest
  let currentFrameState = {
    emailAddress: '',
    phoneNumber: '',
    userId: '',
  }
  try {
    const { isValid, message } = await getFrameMessage(body, { neynarApiKey: NEYNAR_API_KEY }) // NOTE: Frame state data does not exist on localhost.
    if (!isValid) throw new Error('invalid frame message')
    if (message.state?.serialized) {
      currentFrameState = JSON.parse(decodeURIComponent(message.state?.serialized)) as {
        emailAddress: string
        phoneNumber: string
        userId: string
      }
    }
  } catch (e) {
    logger.error('error getting frame message', e)
  }

  const buttonIndex = body.untrustedData?.buttonIndex
  const stateInput = body.untrustedData?.inputText.trim().toUpperCase() as USStateCode

  let zodEmailResult: SafeParseReturnType<string, string>
  let zodPhoneResult: SafeParseReturnType<string, string>
  let link: string | undefined

  switch (frameIndex) {
    case 0: // Intro screen.
      return new NextResponse(getFrameHtmlResponse(frameData[frameIndex]))
    case 1: // Email input screen.
      zodEmailResult = zodEmailAddress.safeParse(body.untrustedData?.inputText)
      if (!zodEmailResult.success) {
        return new NextResponse(
          getFrameHtmlResponse({
            ...frameData[frameIndex - 1],
            input: { text: 'Invalid email - try again' },
          }),
        )
      }
      return new NextResponse(
        getFrameHtmlResponse({
          ...frameData[frameIndex],
          state: { emailAddress: zodEmailResult.data, phoneNumber: '' },
        }),
      )
    case 2: // Phone number input screen.
      zodPhoneResult = zodPhoneNumber.safeParse(body.untrustedData?.inputText)
      if (!zodPhoneResult.success) {
        return new NextResponse(
          getFrameHtmlResponse({
            ...frameData[frameIndex - 1],
            input: { text: 'Invalid phone - try again' },
          }),
        )
      }
      logger.info('email address', currentFrameState.emailAddress)
      logger.info('phone number', zodPhoneResult.data)
      return new NextResponse(
        getFrameHtmlResponse({
          ...frameData[frameIndex],
          state: {
            emailAddress: currentFrameState.emailAddress,
            phoneNumber: normalizePhoneNumber(zodPhoneResult.data),
            // TODO: Include SWC user ID starting here.
          },
        }),
      )
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
      if (!link)
        return new NextResponse(
          getFrameHtmlResponse({
            ...frameData[frameIndex - 1],
            input: { text: 'Invalid state code - try again' },
          }),
        ) // Same screen.
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
      if (!link)
        return new NextResponse(
          getFrameHtmlResponse({
            ...frameData[frameIndex - 1],
            input: { text: 'Invalid state code - try again' },
          }),
        ) // Same screen.
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
