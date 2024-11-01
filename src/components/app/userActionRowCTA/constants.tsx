'use client'

import { UserActionType } from '@prisma/client'

import { LoginDialogWrapper } from '@/components/app/authentication/loginDialogWrapper'
import { GeoGate } from '@/components/app/geoGate'
import { CALL_FLOW_POLITICIANS_CATEGORY } from '@/components/app/userActionFormCallCongressperson/constants'
import { UserActionFormCallCongresspersonDialog } from '@/components/app/userActionFormCallCongressperson/dialog'
import { UserActionFormActionUnavailable } from '@/components/app/userActionFormCommon/actionUnavailable'
import { EMAIL_FLOW_POLITICIANS_CATEGORY } from '@/components/app/userActionFormEmailCongressperson/constants'
import { UserActionFormEmailCongresspersonDialog } from '@/components/app/userActionFormEmailCongressperson/dialog'
import { UserActionFormNFTMintDialog } from '@/components/app/userActionFormNFTMint/dialog'
import { UserActionFormShareOnTwitterDialog } from '@/components/app/userActionFormShareOnTwitter/dialog'
import { UserActionFormVoterAttestationDialog } from '@/components/app/userActionFormVoterAttestation/dialog'
import { UserActionFormVoterRegistrationDialog } from '@/components/app/userActionFormVoterRegistration/dialog'
import { UserActionFormVotingInformationResearchedDialog } from '@/components/app/userActionFormVotingInformationResearched/dialog'
import { UserActionRowCTAProps } from '@/components/app/userActionRowCTA'
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'
import { InternalLink } from '@/components/ui/link'
import { useDialog } from '@/hooks/useDialog'
import { useLocale } from '@/hooks/useLocale'
import { ActiveClientUserActionType } from '@/utils/shared/activeUserAction'
import { TOTAL_CRYPTO_ADVOCATE_COUNT_DISPLAY_NAME } from '@/utils/shared/constants'
import { DEFAULT_SUPPORTED_COUNTRY_CODE } from '@/utils/shared/supportedCountries'
import { getIntlUrls } from '@/utils/shared/urls'
import { USER_ACTION_TO_CAMPAIGN_NAME_DEFAULT_MAP } from '@/utils/shared/userActionCampaigns'
import { getYourPoliticianCategoryShortDisplayName } from '@/utils/shared/yourPoliticianCategory'

const USER_ACTION_ROW_CTA_INFO: Record<
  ActiveClientUserActionType,
  Omit<UserActionRowCTAProps, 'state'>
> = {
  [UserActionType.OPT_IN]: {
    actionType: UserActionType.OPT_IN,
    image: { src: '/actionTypeIcons/optIn.png' },
    text: 'Join Stand With Crypto',
    subtext: `Join over ${TOTAL_CRYPTO_ADVOCATE_COUNT_DISPLAY_NAME} advocates fighting to keep crypto in America.`,
    shortText: 'Join Stand With Crypto',
    shortSubtext: 'Join the movement to keep crypto in America.',
    canBeTriggeredMultipleTimes: false,
    WrapperComponent: ({ children }) => (
      <LoginDialogWrapper authenticatedContent={children}>{children}</LoginDialogWrapper>
    ),
  },
  [UserActionType.VOTER_REGISTRATION]: {
    actionType: UserActionType.VOTER_REGISTRATION,
    image: { src: '/actionTypeIcons/registerToVote.png' },
    text: 'Check your voter registration',
    subtext: 'Double check your registration information or find out how to get registered.',
    shortText: "Make sure you're registered to vote",
    shortSubtext: 'Double check your registration information or find out how to get registered.',
    canBeTriggeredMultipleTimes: true,
    WrapperComponent: UserActionFormVoterRegistrationDialog,
  },
  [UserActionType.CALL]: {
    actionType: UserActionType.CALL,
    image: { src: '/actionTypeIcons/call.png' },
    text: `Call your ${getYourPoliticianCategoryShortDisplayName(CALL_FLOW_POLITICIANS_CATEGORY, { maxCount: 1 })}`,
    subtext: "The most effective way to make your voice heard. We'll show you how.",
    shortText: 'Make a call',
    shortSubtext: 'Call your senator and tell them crypto matters.',
    canBeTriggeredMultipleTimes: true,
    WrapperComponent: UserActionFormCallCongresspersonDialog,
  },
  [UserActionType.EMAIL]: {
    actionType: UserActionType.EMAIL,
    image: { src: '/actionTypeIcons/email.png' },
    text: `Email your ${getYourPoliticianCategoryShortDisplayName(EMAIL_FLOW_POLITICIANS_CATEGORY)}`,
    subtext: 'Make your voice heard. We make it easy.',
    shortText: 'Send an email',
    shortSubtext: 'We drafted one for you. All you have to do is hit send.',
    canBeTriggeredMultipleTimes: true,
    WrapperComponent: UserActionFormEmailCongresspersonDialog,
  },
  [UserActionType.DONATION]: {
    actionType: UserActionType.DONATION,
    image: { src: '/actionTypeIcons/donate.png' },
    text: 'Donate to Stand With Crypto',
    subtext: "Support Stand with Crypto's aim to mobilize 52 million crypto advocates in the US.",
    shortText: 'Make a donation',
    shortSubtext: 'Donate fiat or crypto to support the mission.',
    canBeTriggeredMultipleTimes: true,
    WrapperComponent: ({ children }) => {
      const locale = useLocale()
      const dialogProps = useDialog({
        analytics: 'User Action Donate Unavailable',
      })
      return (
        <GeoGate
          countryCode={DEFAULT_SUPPORTED_COUNTRY_CODE}
          unavailableContent={
            <Dialog {...dialogProps}>
              <DialogTrigger asChild>{children}</DialogTrigger>
              <DialogContent a11yTitle="Donation" className="max-w-3xl">
                <UserActionFormActionUnavailable
                  onConfirm={() => dialogProps?.onOpenChange?.(false)}
                />
              </DialogContent>
            </Dialog>
          }
        >
          <InternalLink
            className="block text-fontcolor hover:no-underline"
            href={getIntlUrls(locale).donate()}
          >
            {children}
          </InternalLink>
        </GeoGate>
      )
    },
  },
  [UserActionType.TWEET]: {
    actionType: UserActionType.TWEET,
    image: {
      src: '/actionTypeIcons/share.svg',
      width: 40,
      height: 40,
      sizes: '(max-width: 768px) 40px, 50px',
      className: 'object-cover lg:h-[50px] lg:w-[50px]',
    },
    text: 'Follow us on X',
    subtext: 'Follow Stand With Crypto and stay up to date on crypto policy.',
    shortText: 'Follow us on X',
    shortSubtext: 'Follow Stand With Crypto and stay up to date on crypto policy.',
    canBeTriggeredMultipleTimes: true,
    WrapperComponent: UserActionFormShareOnTwitterDialog,
  },
  [UserActionType.NFT_MINT]: {
    actionType: UserActionType.NFT_MINT,
    image: { src: '/actionTypeIcons/mintNFT.png' },
    text: 'Mint your Supporter NFT',
    subtext: 'All mint proceeds are donated to the movement.',
    shortText: 'Mint your NFT',
    shortSubtext: 'All mint proceeds are donated to the movement.',
    canBeTriggeredMultipleTimes: true,
    WrapperComponent: UserActionFormNFTMintDialog,
  },
  [UserActionType.VOTER_ATTESTATION]: {
    actionType: UserActionType.VOTER_ATTESTATION,
    image: { src: '/actionTypeIcons/voterAttestation.png' },
    text: 'Pledge to vote this fall',
    subtext: 'Sign the pledge to research the candidates & turn out to vote.',
    shortText: 'Pledge to vote',
    shortSubtext: 'Pledge to vote This Fall.',
    canBeTriggeredMultipleTimes: true,
    WrapperComponent: UserActionFormVoterAttestationDialog,
  },
  [UserActionType.VOTING_INFORMATION_RESEARCHED]: {
    actionType: UserActionType.VOTING_INFORMATION_RESEARCHED,
    image: { src: '/actionTypeIcons/votingResearched.png' },
    text: 'Prepare to vote',
    subtext:
      'Find your polling location and check to see if there are early voting options in your district.',
    shortText: 'Prepare to vote',
    shortSubtext: 'Find your polling location and learn about early voting options.',
    canBeTriggeredMultipleTimes: true,
    WrapperComponent: UserActionFormVotingInformationResearchedDialog,
  },
}

const USER_ACTION_ROW_CTA_INFO_FROM_CAMPAIGN: Record<
  string,
  Omit<UserActionRowCTAProps, 'state'>
> = {}

export function getUserActionCTAInfo(actionType: ActiveClientUserActionType, campaign?: string) {
  if (!campaign || campaign === USER_ACTION_TO_CAMPAIGN_NAME_DEFAULT_MAP[actionType]) {
    return USER_ACTION_ROW_CTA_INFO[actionType]
  }

  if (USER_ACTION_ROW_CTA_INFO_FROM_CAMPAIGN[campaign]) {
    return USER_ACTION_ROW_CTA_INFO_FROM_CAMPAIGN[campaign]
  }

  throw new Error(`No CTA info found for campaign: ${campaign}`)
}
