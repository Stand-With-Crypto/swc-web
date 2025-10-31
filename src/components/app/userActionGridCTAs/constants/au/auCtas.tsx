import { UserActionType } from '@prisma/client'
import Link from 'next/link'

import { LoginDialogWrapper } from '@/components/app/authentication/loginDialogWrapper'
import { getEmailActionWrapperComponentByCampaignName } from '@/components/app/userActionFormEmailCongressperson/getWrapperComponentByCampaignName'
import { UserActionFormFollowLinkedInDialog } from '@/components/app/userActionFormFollowOnLinkedIn/common/dialog'
import { getLetterActionWrapperComponentByCampaignName } from '@/components/app/userActionFormLetter/getWrapperComponentByCampaignName'
import { UserActionFormReferDialog } from '@/components/app/userActionFormRefer/dialog'
import { UserActionFormShareOnTwitterDialog } from '@/components/app/userActionFormShareOnTwitter/common/dialog'
import { UserActionViewKeyPageDialog } from '@/components/app/userActionFormViewKeyPage/dialog'
import { UserActionGridCTA } from '@/components/app/userActionGridCTAs/types'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { getIntlUrls } from '@/utils/shared/urls'
import {
  AUUserActionEmailCampaignName,
  AUUserActionLetterCampaignName,
  AUUserActionLinkedInCampaignName,
  AUUserActionPollCampaignName,
  AUUserActionReferCampaignName,
  AUUserActionTweetCampaignName,
  AUUserActionViewKeyPageCampaignName,
  AUUserActionViewKeyRacesCampaignName,
} from '@/utils/shared/userActionCampaigns/au/auUserActionCampaigns'
import { UserActionOptInCampaignName } from '@/utils/shared/userActionCampaigns/common'

const countryCode = SupportedCountryCodes.AU

const urls = getIntlUrls(countryCode)

export const AU_USER_ACTION_CTAS_FOR_GRID_DISPLAY: UserActionGridCTA = {
  [UserActionType.OPT_IN]: {
    title: 'Join Stand With Crypto Australia',
    description: `Join the movement to make your voice heard.`,
    mobileCTADescription: 'Join the movement to make your voice heard.',
    campaignsModalDescription: `Join the movement to make your voice heard.`,
    image: '/au/actionTypeIcons/opt-in.png',
    campaigns: [
      {
        actionType: UserActionType.OPT_IN,
        campaignName: UserActionOptInCampaignName.DEFAULT,
        isCampaignActive: true,
        title: 'Join Stand With Crypto Australia',
        description: `Join the movement to make your voice heard.`,
        canBeTriggeredMultipleTimes: false,
        WrapperComponent: ({ children }) => (
          <LoginDialogWrapper authenticatedContent={children}>{children}</LoginDialogWrapper>
        ),
      },
    ],
  },
  [UserActionType.EMAIL]: {
    title: 'Email your member of Parliament',
    description: 'Tell your MP It’s time to support crypto in Australia',
    campaignsModalDescription: 'Tell your MP It’s time to support crypto in Australia',
    image: '/au/actionTypeIcons/email.png',
    campaigns: [
      {
        actionType: UserActionType.EMAIL,
        campaignName: AUUserActionEmailCampaignName.DEFAULT,
        isCampaignActive: false,
        title: `Email your member of Parliament`,
        description: 'Tell your MP to support responsible crypto policy — send an email now!',
        canBeTriggeredMultipleTimes: true,
        WrapperComponent: getEmailActionWrapperComponentByCampaignName({
          countryCode,
          campaignName: AUUserActionEmailCampaignName.DEFAULT,
        }),
      },
      {
        actionType: UserActionType.EMAIL,
        campaignName: AUUserActionEmailCampaignName.AU_NEWMODE_DEBANKING,
        isCampaignActive: false,
        title: 'Email your MP to stop unfair debanking',
        description: 'Urge them to stand up for financial access and innovation.',
        canBeTriggeredMultipleTimes: true,
        WrapperComponent: getEmailActionWrapperComponentByCampaignName({
          countryCode,
          campaignName: AUUserActionEmailCampaignName.AU_NEWMODE_DEBANKING,
        }),
      },
      {
        actionType: UserActionType.EMAIL,
        campaignName: AUUserActionEmailCampaignName.AU_Q2_2025_ELECTION,
        isCampaignActive: false,
        title: `Email your member of Parliament`,
        description: 'Tell your MP to support responsible crypto policy — send an email now!',
        canBeTriggeredMultipleTimes: true,
        WrapperComponent: getEmailActionWrapperComponentByCampaignName({
          countryCode,
          campaignName: AUUserActionEmailCampaignName.AU_Q2_2025_ELECTION,
        }),
      },
      {
        actionType: UserActionType.EMAIL,
        campaignName: AUUserActionEmailCampaignName.WELCOME_MP_BACK_TO_PARLIAMENT_2025,
        isCampaignActive: false,
        title: 'Email your MP',
        description: 'Advocate for crypto reforms',
        canBeTriggeredMultipleTimes: true,
        WrapperComponent: getEmailActionWrapperComponentByCampaignName({
          countryCode,
          campaignName: AUUserActionEmailCampaignName.WELCOME_MP_BACK_TO_PARLIAMENT_2025,
        }),
      },
      {
        actionType: UserActionType.EMAIL,
        campaignName: AUUserActionEmailCampaignName.PROTECT_CRYPTO_INNOVATION_2025,
        isCampaignActive: true,
        title: 'Email your MP',
        description: 'Advocate for crypto reforms',
        canBeTriggeredMultipleTimes: true,
        WrapperComponent: getEmailActionWrapperComponentByCampaignName({
          countryCode,
          campaignName: AUUserActionEmailCampaignName.PROTECT_CRYPTO_INNOVATION_2025,
        }),
      },
    ],
  },
  [UserActionType.VIEW_KEY_PAGE]: {
    title: 'Email your member of Parliament',
    description:
      'Make your voice heard on important crypto policy issues by emailing your representatives',
    campaignsModalDescription:
      'Make your voice heard on important crypto policy issues by emailing your representatives',
    image: '/au/actionTypeIcons/email.png',
    campaigns: [
      {
        actionType: UserActionType.VIEW_KEY_PAGE,
        campaignName: AUUserActionViewKeyPageCampaignName.AU_Q2_2025_ELECTION,
        isCampaignActive: false,
        title: `Email your member of Parliament`,
        description: 'Tell your MP to support responsible crypto policy — send an email now!',
        canBeTriggeredMultipleTimes: true,
        WrapperComponent: ({ children }) => (
          <UserActionViewKeyPageDialog countryCode={countryCode} url={urls.newmodeElectionAction()}>
            {children}
          </UserActionViewKeyPageDialog>
        ),
      },
      {
        actionType: UserActionType.VIEW_KEY_PAGE,
        campaignName: AUUserActionViewKeyPageCampaignName.AU_NEWMODE_DEBANKING,
        isCampaignActive: false,
        title: 'Email your MP to stop unfair debanking',
        description: 'Urge them to stand up for financial access and innovation.',
        canBeTriggeredMultipleTimes: true,
        WrapperComponent: ({ children }) => (
          <UserActionViewKeyPageDialog
            countryCode={countryCode}
            url={urls.newmodeDebankingAction()}
          >
            {children}
          </UserActionViewKeyPageDialog>
        ),
      },
    ],
  },
  [UserActionType.VIEW_KEY_RACES]: {
    title: 'View Key Races in Australia',
    description:
      'View the key races occurring across Australia that will impact the future of crypto.',
    campaignsModalDescription:
      'View the key races occurring across Australia that will impact the future of crypto.',
    image: '/au/actionTypeIcons/view-key-races.png',
    campaigns: [
      {
        actionType: UserActionType.VIEW_KEY_RACES,
        campaignName: AUUserActionViewKeyRacesCampaignName.H1_2025,
        isCampaignActive: false,
        title: 'View Key Races in Australia',
        description:
          'Viewed the key races that occurred across Australia that could impact the future of crypto in early 2025.',
        canBeTriggeredMultipleTimes: true,
        WrapperComponent: ({ children }) => <Link href={urls.locationKeyRaces()}>{children}</Link>,
      },
    ],
  },
  [UserActionType.TWEET]: {
    title: 'Follow us on X',
    description: 'Stay up to date on crypto policy by following @StandWCrypto_AU on X.',
    mobileCTADescription: 'Stay up to date on crypto policy.',
    campaignsModalDescription:
      'Stay up to date on crypto policy by following @StandWCrypto_AU on X.',
    image: '/au/actionTypeIcons/tweet.png',
    campaigns: [
      {
        actionType: UserActionType.TWEET,
        campaignName: AUUserActionTweetCampaignName.DEFAULT,
        isCampaignActive: true,
        title: 'Follow us on X',
        description: 'Stay up to date on crypto policy by following @StandWCrypto_AU on X.',
        canBeTriggeredMultipleTimes: true,
        WrapperComponent: ({ children }) => (
          <UserActionFormShareOnTwitterDialog countryCode={countryCode}>
            {children}
          </UserActionFormShareOnTwitterDialog>
        ),
      },
    ],
  },
  [UserActionType.REFER]: {
    title: 'Refer a friend',
    description: 'Get your friend to signup for Stand With Crypto and verify their account.',
    mobileCTADescription:
      'Get your friend to signup for Stand With Crypto and verify their account.',
    campaignsModalDescription: 'Share your referral link with friends to help grow our movement.',
    image: '/au/actionTypeIcons/refer.png',
    campaigns: [
      {
        actionType: UserActionType.REFER,
        campaignName: AUUserActionReferCampaignName.DEFAULT,
        isCampaignActive: true,
        title: 'Refer a friend',
        description: 'You have referred friends to join Stand With Crypto.',
        canBeTriggeredMultipleTimes: true,
        WrapperComponent: ({ children }) => (
          <LoginDialogWrapper
            authenticatedContent={
              <UserActionFormReferDialog countryCode={countryCode}>
                {children}
              </UserActionFormReferDialog>
            }
          >
            {children}
          </LoginDialogWrapper>
        ),
      },
    ],
  },
  [UserActionType.POLL]: {
    title: 'Take the poll',
    description: 'Take the poll and see the results.',
    mobileCTADescription: 'Take the poll and see the results.',
    campaignsModalDescription: 'Take the poll and see the results.',
    image: '/actionTypeIcons/voterAttestation.png',
    link: ({ children }) => (
      <Link className="w-full" href={urls.polls()}>
        {children}
      </Link>
    ),
    campaigns: [
      {
        actionType: UserActionType.POLL,
        campaignName: AUUserActionPollCampaignName.CRYPTO_NEWS,
        isCampaignActive: true,
        title: 'Take the poll',
        description: 'Take the poll and see the results.',
        canBeTriggeredMultipleTimes: true,
        WrapperComponent: null,
      },
      {
        actionType: UserActionType.POLL,
        campaignName: AUUserActionPollCampaignName.DIGITAL_ASSETS,
        isCampaignActive: true,
        title: 'Take the poll',
        description: 'Take the poll and see the results.',
        canBeTriggeredMultipleTimes: true,
        WrapperComponent: null,
      },
      {
        actionType: UserActionType.POLL,
        campaignName: AUUserActionPollCampaignName.ENCOURAGE,
        isCampaignActive: true,
        title: 'Take the poll',
        description: 'Take the poll and see the results.',
        canBeTriggeredMultipleTimes: true,
        WrapperComponent: null,
      },
    ],
  },
  [UserActionType.LINKEDIN]: {
    title: 'Follow us on LinkedIn',
    description: 'Follow us on LinkedIn and stay up to date on crypto policy changes in Australia.',
    mobileCTADescription:
      'Follow us on LinkedIn and stay up to date on crypto policy changes in Australia.',
    campaignsModalDescription:
      'Follow us on LinkedIn and stay up to date on crypto policy changes in Australia.',
    image: '/au/actionTypeIcons/follow-linkedin.png',
    campaigns: [
      {
        actionType: UserActionType.LINKEDIN,
        campaignName: AUUserActionLinkedInCampaignName.DEFAULT,
        isCampaignActive: true,
        title: 'Follow us on LinkedIn',
        description:
          'Follow us on LinkedIn and stay up to date on crypto policy changes in Australia.',
        canBeTriggeredMultipleTimes: true,
        WrapperComponent: ({ children }) => (
          <UserActionFormFollowLinkedInDialog countryCode={countryCode}>
            {children}
          </UserActionFormFollowLinkedInDialog>
        ),
      },
    ],
  },
  [UserActionType.LETTER]: {
    title: 'Send a letter to your MP',
    description: 'Tell your MP its time to support crypto',
    mobileCTADescription: 'Tell your MP its time to support crypto',
    campaignsModalDescription: 'Tell your MP its time to support crypto',
    image: '/au/actionTypeIcons/letter.png',
    campaigns: [
      {
        actionType: UserActionType.LETTER,
        campaignName: AUUserActionLetterCampaignName.DEFAULT,
        isCampaignActive: true,
        title: 'Send a letter to your MP',
        description: 'Tell your MP its time to support crypto',
        canBeTriggeredMultipleTimes: true,
        WrapperComponent: ({ children }) => (
          <LoginDialogWrapper
            authenticatedContent={getLetterActionWrapperComponentByCampaignName({
              countryCode,
              campaignName: AUUserActionLetterCampaignName.DEFAULT,
            })({ children })}
          >
            {children}
          </LoginDialogWrapper>
        ),
      },
    ],
  },
}
