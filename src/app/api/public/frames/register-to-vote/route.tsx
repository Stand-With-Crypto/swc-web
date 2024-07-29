import {
  FrameImageMetadata,
  FrameMetadataType,
  FrameRequest,
  getFrameHtmlResponse,
  getFrameMessage,
} from '@coinbase/onchainkit/frame'
import {
  NFTCurrency,
  NFTMintStatus,
  NFTMintType,
  SupportedUserCryptoNetwork,
  UserActionOptInType,
  UserActionType,
} from '@prisma/client'
import { NextRequest, NextResponse } from 'next/server'
import { number, SafeParseReturnType, string } from 'zod'

import { REGISTRATION_URLS_BY_STATE } from '@/components/app/userActionFormVoterRegistration/constants'
import {
  ExternalUserActionOptInResponse,
  ExternalUserActionOptInResult,
  handleExternalUserActionOptIn,
} from '@/utils/server/externalOptIn/handleExternalUserActionOptIn'
import { I_AM_A_VOTER_NFT_CONTRACT_ADDRESS } from '@/utils/server/nft/constants'
import { prismaClient } from '@/utils/server/prismaClient'
import { getServerAnalytics } from '@/utils/server/serverAnalytics'
import { getLocalUserFromUser } from '@/utils/server/serverLocalUser'
import { NEYNAR_API_KEY } from '@/utils/shared/neynarAPIKey'
import { NFTSlug } from '@/utils/shared/nft'
import { normalizePhoneNumber } from '@/utils/shared/phoneNumber'
import { fullUrl } from '@/utils/shared/urls'
import {
  UserActionOptInCampaignName,
  UserActionVoterRegistrationCampaignName,
} from '@/utils/shared/userActionCampaigns'
import { US_STATE_CODE_TO_DISPLAY_NAME_MAP, USStateCode } from '@/utils/shared/usStateUtils'
import { zodEmailAddress } from '@/validation/fields/zodEmailAddress'
import { zodPhoneNumber } from '@/validation/fields/zodPhoneNumber'

export const dynamic = 'force-dynamic'

const FRAME_QUERY_PARAMETER = 'frame'

const zodFrameIndex = number().int().nonnegative()
const zodButtonIndex = number().int().positive().optional()
const zodTransactionHash = string().refine(str => str.length === 66 && str.startsWith('0x'))
const zodStateCode = string().refine(
  value => {
    return Object.keys(US_STATE_CODE_TO_DISPLAY_NAME_MAP).includes(value.toUpperCase())
  },
  {
    message: 'Invalid state code',
  },
)

const frameEnterEmail = {
  input: {
    text: 'Enter your email address',
  },
  buttons: [
    {
      label: `View Privacy Policy`,
      action: 'link',
      target: fullUrl('/privacy'),
    },
    {
      label: `Next →`,
    },
  ],
  image: {
    src: fullUrl('/api/public/frames/register-to-vote/image/1'),
  },
  postUrl: fullUrl('/api/public/frames/register-to-vote?frame=1'),
} satisfies FrameMetadataType

const frameEnterPhone = {
  input: {
    text: 'Enter your phone (XXX-XXX-XXXX)',
  },
  buttons: [
    {
      label: `View Privacy Policy`,
      action: 'link',
      target: fullUrl('/privacy'),
    },
    {
      label: `Next →`,
    },
  ],
  image: {
    src: fullUrl('/api/public/frames/register-to-vote/image/2'),
  },
  postUrl: fullUrl('/api/public/frames/register-to-vote?frame=2'),
} satisfies FrameMetadataType

const frameAreYouRegisteredToVote = {
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
} satisfies FrameMetadataType

const frameEnterStateCode = {
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
} satisfies FrameMetadataType

const frameRegisterToVote = {
  buttons: [
    {
      label: 'Register to vote',
      action: 'link',
      target: 'https://www.usa.gov/register-to-vote', // This link gets overwritten when the user inputs their state code.
    },
    {
      label: 'Next →',
    },
  ],
  image: {
    src: fullUrl('/api/public/frames/register-to-vote/image/5'),
  },
  postUrl: fullUrl('/api/public/frames/register-to-vote?frame=5'),
} satisfies FrameMetadataType

const frameMint = {
  buttons: [
    {
      label: `Mint`,
      action: 'tx',
      target: fullUrl('/api/public/frames/register-to-vote/tx'),
    },
  ],
  image: {
    src: fullUrl('/api/public/frames/register-to-vote/image/6'),
  },
  postUrl: fullUrl('/api/public/frames/register-to-vote?frame=6'),
} satisfies FrameMetadataType

const frameFinal = {
  buttons: [
    {
      label: 'Go to Stand With Crypto',
      action: 'link',
      target: fullUrl('/'),
    },
  ],
  image: {
    src: fullUrl('/api/public/frames/register-to-vote/image/7'),
  },
  postUrl: fullUrl('/api/public/frames/register-to-vote?frame=7'),
} satisfies FrameMetadataType

/**
 * Every time a Farcaster user interacts with the frame, the frame host sends a POST request to this endpoint.
 *
 * @param req
 * @returns
 */
export async function POST(req: NextRequest): Promise<Response> {
  let currentFrameState = {
    emailAddress: '',
    phoneNumber: '',
    userId: '',
    sessionId: '',
    voterRegistrationState: '',
    registrationType: '',
  }
  let interactorType: string = ''
  let cryptoAddress: string = ''
  let link: string = ''
  let doesUserActionAlreadyExists: boolean = false
  let zodEmailResult: SafeParseReturnType<string, string>
  let zodPhoneResult: SafeParseReturnType<string, string>
  let zodStateCodeResult: SafeParseReturnType<string, string>
  let zodTransactionHashResult: SafeParseReturnType<string, string>
  let optInResult: ExternalUserActionOptInResponse<ExternalUserActionOptInResult>

  const body: FrameRequest = (await req.json()) as FrameRequest

  const url = new URL(req.url)
  const queryParams = url.searchParams

  const frameIndexResult = zodFrameIndex.safeParse(Number(queryParams.get(FRAME_QUERY_PARAMETER)))
  if (!frameIndexResult.success) {
    return NextResponse.json({ error: 'invalid frame index' }, { status: 400 })
  }
  const frameIndex = frameIndexResult.data

  const buttonIndexResult = zodButtonIndex.safeParse(body.untrustedData?.buttonIndex)
  if (!buttonIndexResult.success) {
    return NextResponse.json({ error: 'invalid button index' }, { status: 400 })
  }
  const buttonIndex = buttonIndexResult.data

  // NOTES:
  // - Frame state data does not exist on localhost.
  // - `getFrameMessage` does not work on localhost either.
  const { isValid, message } = await getFrameMessage(body, { neynarApiKey: NEYNAR_API_KEY })
  if (!isValid) return NextResponse.json({ error: 'invalid frame message' }, { status: 400 })
  if (message.state?.serialized) {
    currentFrameState = JSON.parse(decodeURIComponent(message.state?.serialized)) as {
      emailAddress: string
      phoneNumber: string
      userId: string
      sessionId: string
      voterRegistrationState: string
      registrationType: string
    }
  }
  if (message.interactor) {
    interactorType = message.interactor.verified_accounts[0] ? 'verified' : 'Farcaster custody'

    // For the crypto address in which the NFT will be sent to, we are using the first verified address that is linked to the Farcaster account.
    // If there are no verified addresses, we use the Farcaster custody address.
    cryptoAddress = message.interactor.verified_accounts[0] ?? message.interactor.custody_address
  }

  // We return the next frame based on the `frame` query parameter.
  switch (frameIndex) {
    case 0: // Intro screen.
      return new NextResponse(getFrameHtmlResponse(frameEnterEmail)) // Email input screen.
    case 1: // Email input screen.
      zodEmailResult = zodEmailAddress.safeParse(body.untrustedData?.inputText)
      if (!zodEmailResult.success) {
        return new NextResponse(
          getFrameHtmlResponse({
            ...frameEnterEmail,
            image: {
              src: (frameEnterEmail.image as FrameImageMetadata).src + '?shouldShowError=true',
            },
          }),
        ) // Same screen.
      }
      return new NextResponse(
        getFrameHtmlResponse({
          ...frameEnterPhone,
          state: { emailAddress: zodEmailResult.data },
        }),
      ) // Phone number input screen.
    case 2: // Phone number input screen.
      zodPhoneResult = zodPhoneNumber.safeParse(body.untrustedData?.inputText)
      if (!zodPhoneResult.success) {
        return new NextResponse(
          getFrameHtmlResponse({
            // Same screen.
            ...frameEnterPhone,
            state: { emailAddress: currentFrameState.emailAddress },
            image: {
              src: (frameEnterPhone.image as FrameImageMetadata).src + '?shouldShowError=true',
            },
          }),
        ) // Same screen.
      }

      // We create the user action for the user to opt-in to the voter registration campaign.
      optInResult = await handleExternalUserActionOptIn({
        emailAddress: currentFrameState.emailAddress,
        cryptoAddress,
        optInType: UserActionOptInType.SWC_SIGN_UP_AS_SUBSCRIBER,
        campaignName: UserActionOptInCampaignName.DEFAULT,
        isVerifiedEmailAddress: false,
        phoneNumber: normalizePhoneNumber(zodPhoneResult.data),
        hasOptedInToReceiveSMSFromSWC: true,
        hasOptedInToEmails: true,
        acquisitionOverride: {
          source: 'farcaster-frames',
          medium: 'frames-register-to-vote',
        },
        additionalAnalyticsProperties: {
          'Interactor Type':
            interactorType === 'verified'
              ? 'Farcaster Verified Address'
              : 'Farcaster Custody Address',
        },
      })

      // If the user (by crypto address) has already completed the action, then then we skip to the final screen.
      // The reason why we check this after receiving their email and phone number instead of early on
      // is because we want the user to opt-in for SMS if they haven't already.
      doesUserActionAlreadyExists = await checkCompleteActionByCryptoAddress(
        optInResult.userId,
        cryptoAddress,
      )
      if (doesUserActionAlreadyExists) {
        return new NextResponse(
          getFrameHtmlResponse({
            ...frameFinal,
            buttons: [
              {
                ...frameFinal.buttons[0],
                target:
                  frameFinal.buttons[0].target +
                  `?userId=${optInResult.userId}&sessionId=${optInResult.sessionId}`, // We pass in the user ID and session ID as query parameters to SWC website.
              },
            ],
            state: {
              userId: optInResult.userId,
              sessionId: optInResult.sessionId,
            },
            image: {
              src: (frameFinal.image as FrameImageMetadata).src + '?hasAlreadyCompletedAction=true',
            },
          }),
        ) // Final screen.
      }

      return new NextResponse(
        getFrameHtmlResponse({
          ...frameAreYouRegisteredToVote,
          state: {
            userId: optInResult.userId,
            sessionId: optInResult.sessionId,
          },
        }),
      ) // "Are you registered to vote" screen.
    case 3: // "Are you registered to vote" screen.
      switch (buttonIndex) {
        case 1:
          return new NextResponse(
            getFrameHtmlResponse({
              ...frameMint,
              buttons: [
                {
                  ...frameMint.buttons[0],
                  label: `Mint to your ${interactorType} wallet`,
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
              ...frameEnterStateCode,
              state: {
                userId: currentFrameState.userId,
                sessionId: currentFrameState.sessionId,
                registrationType: 'register',
              },
              image: {
                src:
                  (frameEnterStateCode.image as FrameImageMetadata).src +
                  '?registrationType=register',
              },
            }),
          ) // Register state screen.
        case 3:
          return new NextResponse(
            getFrameHtmlResponse({
              ...frameEnterStateCode,
              state: {
                userId: currentFrameState.userId,
                sessionId: currentFrameState.sessionId,
                registrationType: 'checkRegistration',
              },
              image: {
                src:
                  (frameEnterStateCode.image as FrameImageMetadata).src +
                  '?registrationType=checkRegistration',
              },
            }),
          ) // Check registration screen.
      }
      break
    case 4: // Register OR check registration state screen.
      zodStateCodeResult = zodStateCode.safeParse(
        body.untrustedData?.inputText?.trim().toUpperCase(),
      )
      if (!zodStateCodeResult.success) {
        return new NextResponse(
          getFrameHtmlResponse({
            ...frameEnterStateCode,
            state: {
              userId: currentFrameState.userId,
              sessionId: currentFrameState.sessionId,
              registrationType: currentFrameState.registrationType,
            },
            image: {
              src:
                (frameEnterStateCode.image as FrameImageMetadata).src +
                `?registrationType=${currentFrameState.registrationType}&shouldShowError=true`,
            },
          }),
        ) // Same screen.
      }
      link = REGISTRATION_URLS_BY_STATE[zodStateCodeResult.data as USStateCode]['registerUrl']
      return new NextResponse(
        getFrameHtmlResponse({
          ...frameRegisterToVote,
          buttons: [
            {
              ...frameRegisterToVote.buttons[0],
              target: link,
              label:
                currentFrameState.registrationType === 'checkRegistration'
                  ? 'Check registration status'
                  : 'Register to vote',
            },
            frameRegisterToVote.buttons[1],
          ],
          state: {
            userId: currentFrameState.userId,
            sessionId: currentFrameState.sessionId,
            voterRegistrationState: zodStateCodeResult.data,
            registrationType: currentFrameState.registrationType,
          },
          image: {
            src:
              (frameRegisterToVote.image as FrameImageMetadata).src +
              `?registrationType=${currentFrameState.registrationType}`,
          },
        }),
      ) // Registration OR check registration screen with respective link.
    case 5: // Register screen OR check registration screen.
      return new NextResponse(
        getFrameHtmlResponse({
          ...frameMint,
          buttons: [
            {
              ...frameMint.buttons[0],
              label: `Mint to your ${interactorType} wallet`,
            },
          ],
          state: {
            userId: currentFrameState.userId,
            sessionId: currentFrameState.sessionId,
            voterRegistrationState: currentFrameState.voterRegistrationState,
          },
        }),
      ) // Mint screen
    case 6: // Mint screen.
      if (!body.untrustedData?.transactionId) {
        return NextResponse.json(
          { error: 'no transaction hash has been provided' },
          { status: 400 },
        )
      }
      zodTransactionHashResult = zodTransactionHash.safeParse(body.untrustedData?.transactionId)
      if (!zodTransactionHashResult.success) {
        return NextResponse.json({ error: 'invalid transaction hash' }, { status: 400 })
      }

      // If the user successfully mints the NFT, then we upsert the crypto address in our database and create the respective user action.
      await upsertCryptoAddressAndCreateAction(
        currentFrameState.userId,
        currentFrameState.sessionId,
        cryptoAddress,
        interactorType,
        currentFrameState.voterRegistrationState,
        body.untrustedData?.transactionId,
      )

      return new NextResponse(
        getFrameHtmlResponse({
          ...frameFinal,
          buttons: [
            {
              ...frameFinal.buttons[0],
              target:
                frameFinal.buttons[0].target +
                `?userId=${currentFrameState.userId}&sessionId=${currentFrameState.sessionId}`, // We pass in the user ID and session ID as query parameters to SWC website.
            },
          ],
          state: {
            userId: currentFrameState.userId,
            sessionId: currentFrameState.sessionId,
            voterRegistrationState: currentFrameState.voterRegistrationState,
          },
        }),
      ) // Final screen.
  }

  return NextResponse.json({ error: 'invalid frame index' }, { status: 400 })
}

/**
 * Helper function to get existing user information for the existing action.
 * We primarily screen by the crypto address.
 * Why?
 * - CASE 1: A user does not have an existing SWC account, so they go through the frame and complete
 *   the registration flow - all is good. Afterwards, the user might try to go through the frame again
 *   in attempts to mint another NFT.
 *   - In this case, we already know that that their Farcaster wallet address has already completed the action
 *     (and has received the NFT), so we should redirect them to the SWC website with the right information.
 *   - NOTE: Crypto address is the one thing that is not user-inputted, so we can trust it generally.
 * - CASE 2: A user has a SWC account with their email and has already completed
 *   the action (hence they have an embedded wallet address), but the SWC account is not associated
 *   with their Farcaster wallet address. In other words, their embedded wallet address has the NFT, but
 *   their Farcaster wallet address does NOT have the NFT.
 *   - In this case, we want to allow the user to mint to their Farcaster wallet address if they want.
 *   - If they decide to input a different email address, then a new user will be created.
 *   - If they decide to input the same email address, then the Farcaster wallet address will be tied to their existing SWC account.
 * - CASE 3: A user completes the action via the frame and mints the NFT to their Farcaster custody address. Afterwards,
 *   the user verifies a wallet address, then they wants to mint the NFT to their verified wallet address.
 *   - In this case, we want to allow the user to mint to their verified wallet address if they want.
 * In short, as long as the address has not yet completed the action, we should allow the user to go through the frame.
 * @param userId
 * @returns
 */
async function checkCompleteActionByCryptoAddress(userId: string, cryptoAddress: string) {
  const existingAction = await prismaClient.userAction.findFirst({
    where: {
      actionType: UserActionType.VOTER_REGISTRATION,
      campaignName: UserActionVoterRegistrationCampaignName.DEFAULT,
      userId,
      userCryptoAddress: {
        cryptoAddress: cryptoAddress.toLowerCase(),
        cryptoNetwork: SupportedUserCryptoNetwork.ETH,
      },
    },
  })
  return !!existingAction
}

/**
 * Helper function to create the user action.
 *
 * @param userId
 * @param sessionId
 * @param cryptoAddress
 * @param voterRegistrationStateCode
 * @param transactionHash
 */
async function upsertCryptoAddressAndCreateAction(
  userId: string,
  sessionId: string,
  cryptoAddress: string,
  interactorType: string,
  voterRegistrationStateCode: string,
  transactionHash: string,
) {
  // Crypto address should exist at this point.
  const userCryptoAddress = await prismaClient.userCryptoAddress.findFirstOrThrow({
    where: {
      cryptoAddress: cryptoAddress.toLowerCase(),
      cryptoNetwork: SupportedUserCryptoNetwork.ETH,
      userId,
    },
  })
  const user = await prismaClient.user.findFirstOrThrow({
    where: { id: userId },
    include: { primaryUserEmailAddress: true },
  })

  const userAction = await prismaClient.userAction.create({
    data: {
      user: { connect: { id: userId } },
      actionType: UserActionType.VOTER_REGISTRATION,
      campaignName: UserActionVoterRegistrationCampaignName.DEFAULT,
      userCryptoAddress: { connect: { id: userCryptoAddress.id } },
      userEmailAddress: { connect: { id: user?.primaryUserEmailAddress?.id } },
      userSession: { connect: { id: sessionId } },
      userActionVoterRegistration: {
        create: {
          ...(voterRegistrationStateCode && { usaState: voterRegistrationStateCode }),
        },
      },
      nftMint: {
        create: {
          nftSlug: NFTSlug.I_AM_A_VOTER,
          mintType: NFTMintType.FARCASTER_FRAME_PURCHASED,
          contractAddress: I_AM_A_VOTER_NFT_CONTRACT_ADDRESS,
          transactionHash: transactionHash.toLowerCase(),
          status: NFTMintStatus.CLAIMED,
          costAtMint: 0,
          costAtMintCurrencyCode: NFTCurrency.ETH,
          costAtMintUsd: 0,
        },
      },
    },
    include: {
      user: true,
    },
  })

  const localUser = getLocalUserFromUser(userAction.user)
  const analytics = getServerAnalytics({ userId, localUser })

  // Tracking analytics for the user action created with an additional "Source" field.
  analytics.trackUserActionCreated({
    actionType: UserActionType.VOTER_REGISTRATION,
    campaignName: UserActionVoterRegistrationCampaignName.DEFAULT,
    userState: 'Existing',
    ...(voterRegistrationStateCode && { usaState: voterRegistrationStateCode }),
    Source: 'Farcaster Frames',
    'Interactor Type':
      interactorType === 'verified' ? 'Farcaster Verified Address' : 'Farcaster Custody Address',
  })
}
