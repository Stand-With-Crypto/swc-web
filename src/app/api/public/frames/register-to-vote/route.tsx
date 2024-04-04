import { getFarcasterUserAddress } from '@coinbase/onchainkit/farcaster'
import { FrameMetadataType, FrameRequest, getFrameHtmlResponse } from '@coinbase/onchainkit/frame'
import { NextRequest, NextResponse } from 'next/server'

import { REGISTRATION_URLS_BY_STATE } from '@/components/app/userActionFormVoterRegistration/constants'
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
        target: `eip155:${BASE_CHAIN_ID}:${I_AM_A_VOTER_NFT_CONTRACT_ADDRESS}`,
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

export async function POST(req: NextRequest): Promise<Response> {
  const url = new URL(req.url)
  const queryParams = url.searchParams
  const frameIndex = Number(queryParams.get('frame'))

  const body: FrameRequest = (await req.json()) as FrameRequest

  const buttonIndex = body.untrustedData?.buttonIndex
  const inputText = body.untrustedData?.inputText as USStateCode

  const userAddress = await getFarcasterUserAddress(body.untrustedData?.fid)

  console.log('FRAME INDEX:', frameIndex)
  console.log('USER ADDRESS:', userAddress)
  console.log('TRUSTED DATA', body.trustedData)
  console.log('BUTTON INDEX:', buttonIndex)
  console.log('INPUT TEXT:', inputText)

  let link
  let dynamicFrameData: FrameMetadataType

  switch (frameIndex) {
    case 0: // Intro screen.
      return new NextResponse(getFrameHtmlResponse(frameData[frameIndex]))
    case 1 || 2: // Email input and phone number input screen.
      // TODO: hook up email and phone number input to SWC registration API.
      // TODO: also determine if it's also possible to tie email <> phone number together... `getUserSessionId` doesn't seem to work.
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
        inputText && REGISTRATION_URLS_BY_STATE[inputText]
          ? REGISTRATION_URLS_BY_STATE[inputText]['registerUrl']
          : undefined
      if (!link) return new NextResponse(getFrameHtmlResponse(frameData[frameIndex - 1])) // Same screen.

      dynamicFrameData = frameData[frameIndex] // Register screen.
      if (dynamicFrameData.buttons) {
        dynamicFrameData.buttons[0].target = link
      }
      return new NextResponse(getFrameHtmlResponse(dynamicFrameData))
    case 5: // Register screen.
      return new NextResponse(getFrameHtmlResponse(frameData[7])) // Mint screen.
    case 6: // Check registration state screen.
      link =
        inputText && REGISTRATION_URLS_BY_STATE[inputText]
          ? REGISTRATION_URLS_BY_STATE[inputText]['checkRegistrationUrl']
          : undefined
      if (!link) return new NextResponse(getFrameHtmlResponse(frameData[frameIndex - 1])) // Same screen.

      dynamicFrameData = frameData[frameIndex] // Check registration screen.
      if (dynamicFrameData.buttons) {
        dynamicFrameData.buttons[0].target = link
      }
      return new NextResponse(getFrameHtmlResponse(dynamicFrameData))
    case 7: // Check registration screen.
      return new NextResponse(getFrameHtmlResponse(frameData[7])) // Mint screen.
    case 8: // Mint screen.
      // TODO: Going to the final screen doesn't work, figure this out.
      return new NextResponse(getFrameHtmlResponse(frameData[frameIndex])) // Final screen.
  }

  return new NextResponse(getFrameHtmlResponse(frameData[Number(frameIndex)]))
}
