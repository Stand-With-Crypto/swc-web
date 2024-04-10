import {
  FrameMetadataType,
  FrameRequest,
  getFrameHtmlResponse,
  getFrameMessage,
} from '@coinbase/onchainkit/frame'
import { UserActionOptInType } from '@prisma/client'
import { NextRequest, NextResponse } from 'next/server'
import { SafeParseReturnType } from 'zod'

import { REGISTRATION_URLS_BY_STATE } from '@/components/app/userActionFormVoterRegistration/constants'
import {
  verifiedSWCPartnersUserActionOptIn,
  VerifiedSWCPartnersUserActionOptInResult,
} from '@/data/verifiedSWCPartners/userActionOptIn'
import {
  VerifiedSWCPartner,
  VerifiedSWCPartnerApiResponse,
} from '@/utils/server/verifiedSWCPartner/constants'
import { getLogger } from '@/utils/shared/logger'
import { NEYNAR_API_KEY } from '@/utils/shared/neynarAPIKey'
import { normalizePhoneNumber } from '@/utils/shared/phoneNumber'
import { fullUrl } from '@/utils/shared/urls'
import { UserActionOptInCampaignName } from '@/utils/shared/userActionCampaigns'
import { USStateCode } from '@/utils/shared/usStateUtils'
import { zodEmailAddress } from '@/validation/fields/zodEmailAddress'
import { zodPhoneNumber } from '@/validation/fields/zodPhoneNumber'

export const dynamic = 'force-dynamic'

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
        action: 'tx',
        target: fullUrl('/api/public/frames/register-to-vote/tx'),
      },
    ],
    image: {
      src: fullUrl('/api/public/frames/register-to-vote/image/8'),
    },
    postUrl: fullUrl('/api/public/frames/register-to-vote?frame=8'),
  },
  {
    buttons: [
      {
        label: 'Go to Stand With Crypto',
        action: 'link',
        target: fullUrl('/'),
      },
    ],
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
    sessionId: '',
  }
  let interactorType: string = ''
  try {
    const { isValid, message } = await getFrameMessage(body, { neynarApiKey: NEYNAR_API_KEY }) // NOTE: Frame state data does not exist on localhost.
    if (!isValid) throw new Error('invalid frame message')
    if (message.state?.serialized) {
      currentFrameState = JSON.parse(decodeURIComponent(message.state?.serialized)) as {
        emailAddress: string
        phoneNumber: string
        userId: string
        sessionId: string
      }
    }
    if (message.interactor)
      interactorType = message.interactor.verified_accounts[0] ? 'verified' : 'Farcaster custody'
  } catch (e) {
    logger.error('error getting frame message', e)
  }

  const buttonIndex = body.untrustedData?.buttonIndex
  const stateInput = body.untrustedData?.inputText?.trim().toUpperCase() as USStateCode

  let zodEmailResult: SafeParseReturnType<string, string>
  let zodPhoneResult: SafeParseReturnType<string, string>
  let link: string | undefined
  let optInResult: VerifiedSWCPartnerApiResponse<VerifiedSWCPartnersUserActionOptInResult>

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
          state: { emailAddress: zodEmailResult.data },
        }),
      )
    case 2: // Phone number input screen.
      zodPhoneResult = zodPhoneNumber.safeParse(body.untrustedData?.inputText)
      if (!zodPhoneResult.success) {
        return new NextResponse(
          getFrameHtmlResponse({
            ...frameData[frameIndex - 1],
            input: { text: 'Invalid phone - try again' },
            state: { emailAddress: currentFrameState.emailAddress },
          }),
        )
      }

      optInResult = await verifiedSWCPartnersUserActionOptIn({
        emailAddress: currentFrameState.emailAddress,
        optInType: UserActionOptInType.SWC_SIGN_UP_AS_SUBSCRIBER,
        campaignName: UserActionOptInCampaignName.DEFAULT,
        isVerifiedEmailAddress: false,
        phoneNumber: normalizePhoneNumber(zodPhoneResult.data),
        hasOptedInToReceiveSMSFromSWC: true,
        hasOptedInToEmails: true,
        partner: VerifiedSWCPartner.FRAMES,
      })

      return new NextResponse(
        getFrameHtmlResponse({
          ...frameData[frameIndex],
          state: {
            userId: optInResult.userId,
            sessionId: optInResult.sessionId,
          },
        }),
      )
    case 3: // "Are you registered to vote" screen.
      switch (buttonIndex) {
        case 1:
          return new NextResponse(
            getFrameHtmlResponse({
              ...frameData[7],
              buttons: [
                {
                  ...frameData[7].buttons![0],
                  label: `Mint to your ${interactorType} crypto address`,
                },
              ],
              state: {
                userId: currentFrameState.userId,
                sessionId: currentFrameState.sessionId,
              },
            }),
          ) // Mint screen.
        case 2:
          return new NextResponse(
            getFrameHtmlResponse({
              ...frameData[3],
              state: {
                userId: currentFrameState.userId,
                sessionId: currentFrameState.sessionId,
              },
            }),
          ) // Register state screen.
        case 3:
          return new NextResponse(
            getFrameHtmlResponse({
              ...frameData[5],
              state: {
                userId: currentFrameState.userId,
                sessionId: currentFrameState.sessionId,
              },
            }),
          ) // Check registration screen.
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
            state: {
              userId: currentFrameState.userId,
              sessionId: currentFrameState.sessionId,
            },
          }),
        ) // Same screen.
      return new NextResponse(
        getFrameHtmlResponse({
          ...frameData[frameIndex],
          buttons: [
            { ...frameData[frameIndex].buttons![0], target: link },
            frameData[frameIndex].buttons![1],
          ],
          state: {
            userId: currentFrameState.userId,
            sessionId: currentFrameState.sessionId,
          },
        }),
      ) // Registration screen with respective link.
    case 5: // Register screen.
      return new NextResponse(
        getFrameHtmlResponse({
          ...frameData[7],
          buttons: [
            { ...frameData[7].buttons![0], label: `Mint to your ${interactorType} crypto address` },
          ],
          state: {
            userId: currentFrameState.userId,
            sessionId: currentFrameState.sessionId,
          },
        }),
      ) // Mint screen.
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
            state: {
              userId: currentFrameState.userId,
              sessionId: currentFrameState.sessionId,
            },
          }),
        ) // Same screen.
      return new NextResponse(
        getFrameHtmlResponse({
          ...frameData[frameIndex],
          buttons: [
            { ...frameData[frameIndex].buttons![0], target: link },
            frameData[frameIndex].buttons![1],
          ],
          state: {
            userId: currentFrameState.userId,
            sessionId: currentFrameState.sessionId,
          },
        }),
      ) // Registration screen with respective link.
    case 7: // Check registration screen.
      return new NextResponse(
        getFrameHtmlResponse({
          ...frameData[7],
          buttons: [
            { ...frameData[7].buttons![0], label: `Mint to your ${interactorType} crypto address` },
          ],
          state: {
            userId: currentFrameState.userId,
            sessionId: currentFrameState.sessionId,
          },
        }),
      ) // Mint screen.
    case 8: // Mint screen.
      logger.info('@@@@@ I AM HERE 1 @@@@')
      logger.info('tx id', body.untrustedData?.transactionId)

      return new NextResponse(
        getFrameHtmlResponse({
          ...frameData[frameIndex],
          state: {
            userId: currentFrameState.userId,
            sessionId: currentFrameState.sessionId,
          },
        }),
      ) // Final screen.
    case 9: // Final screen.
      logger.info('@@@@@ I AM HERE 2 @@@@')

      return new NextResponse(
        getFrameHtmlResponse({
          ...frameData[frameIndex - 1],
          state: {
            userId: currentFrameState.userId,
            sessionId: currentFrameState.sessionId,
          },
        }),
      ) // Stay at final screen.
  }

  return new NextResponse(getFrameHtmlResponse(frameData[Number(frameIndex)]))
}
