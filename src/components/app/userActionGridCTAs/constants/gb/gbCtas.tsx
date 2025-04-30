import { UserActionType } from '@prisma/client'
import Link from 'next/link'

import { LoginDialogWrapper } from '@/components/app/authentication/loginDialogWrapper'
import { UserActionFormFollowLinkedInDialog } from '@/components/app/userActionFormFollowOnLinkedIn/common/dialog'
import { UserActionFormReferDialog } from '@/components/app/userActionFormRefer/dialog'
import { UserActionFormShareOnTwitterDialog } from '@/components/app/userActionFormShareOnTwitter/common/dialog'
import { UserActionViewKeyPageDialog } from '@/components/app/userActionFormViewKeyPage/dialog'
import { UserActionGridCTA } from '@/components/app/userActionGridCTAs/types'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { getIntlUrls } from '@/utils/shared/urls'
import { UserActionOptInCampaignName } from '@/utils/shared/userActionCampaigns/common'
import {
  GBUserActionLinkedInCampaignName,
  GBUserActionPollCampaignName,
  GBUserActionReferCampaignName,
  GBUserActionTweetCampaignName,
  GBUserActionViewKeyPageCampaignName,
} from '@/utils/shared/userActionCampaigns/gb/gbUserActionCampaigns'

const countryCode = SupportedCountryCodes.GB

const urls = getIntlUrls(countryCode)

export const GB_USER_ACTION_CTAS_FOR_GRID_DISPLAY: UserActionGridCTA = {
  [UserActionType.OPT_IN]: {
    title: 'Join Stand With Crypto',
    description: `Join the movement to make your voice heard.`,
    mobileCTADescription: `Join the movement to make your voice heard.`,
    campaignsModalDescription: `Join the movement to make your voice heard.`,
    image: '/gb/actionTypeIcons/opt-in.png',
    campaigns: [
      {
        actionType: UserActionType.OPT_IN,
        campaignName: UserActionOptInCampaignName.DEFAULT,
        isCampaignActive: true,
        title: 'Join Stand With Crypto',
        description: `Join the movement to make your voice heard.`,
        canBeTriggeredMultipleTimes: false,
        WrapperComponent: ({ children }) => (
          <LoginDialogWrapper authenticatedContent={children}>{children}</LoginDialogWrapper>
        ),
      },
    ],
  },
  [UserActionType.TWEET]: {
    title: 'Follow us on X',
    description: 'Stay up to date on crypto policy by following @StandWCrypto_UK on X.',
    mobileCTADescription: 'Stay up to date on crypto policy.',
    campaignsModalDescription:
      'Stay up to date on crypto policy by following @StandWCrypto_UK on X.',
    image: '/gb/actionTypeIcons/tweet.png',
    campaigns: [
      {
        actionType: UserActionType.TWEET,
        campaignName: GBUserActionTweetCampaignName.DEFAULT,
        isCampaignActive: true,
        title: 'Follow us on X',
        description: 'Stay up to date on crypto policy by following @StandWCrypto_UK on X.',
        canBeTriggeredMultipleTimes: true,
        WrapperComponent: ({ children }) => (
          <UserActionFormShareOnTwitterDialog countryCode={countryCode}>
            {children}
          </UserActionFormShareOnTwitterDialog>
        ),
      },
    ],
  },
  [UserActionType.VIEW_KEY_PAGE]: {
    title: 'Email your MP to stop unfair debanking',
    description: 'Urge them to stand up for financial access and innovation.',
    campaignsModalDescription: 'Urge them to stand up for financial access and innovation.',
    image: '/gb/actionTypeIcons/email.png',
    link: ({ children }) => <Link href={urls.emailDeeplink()}>{children}</Link>,
    campaigns: [
      {
        actionType: UserActionType.VIEW_KEY_PAGE,
        campaignName: GBUserActionViewKeyPageCampaignName.NEWMODE_EMAIL_ACTION,
        isCampaignActive: true,
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
  [UserActionType.REFER]: {
    title: 'Refer a Friend',
    description: 'Get your friend to signup for Stand With Crypto and verify their account.',
    mobileCTADescription:
      'Get your friend to signup for Stand With Crypto and verify their account.',
    campaignsModalDescription: 'Share your referral link with friends to help grow our movement.',
    image: '/gb/actionTypeIcons/refer.png',
    campaigns: [
      {
        actionType: UserActionType.REFER,
        campaignName: GBUserActionReferCampaignName.DEFAULT,
        isCampaignActive: true,
        title: 'Refer a Friend',
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
    link: ({ children }) => <Link href={urls.polls()}>{children}</Link>,
    campaigns: [
      {
        actionType: UserActionType.POLL,
        campaignName: GBUserActionPollCampaignName.CRYPTO_NEWS,
        isCampaignActive: true,
        title: 'Take the poll',
        description: 'Take the poll and see the results.',
        canBeTriggeredMultipleTimes: true,
        WrapperComponent: null,
      },
      {
        actionType: UserActionType.POLL,
        campaignName: GBUserActionPollCampaignName.DIGITAL_ASSETS,
        isCampaignActive: true,
        title: 'Take the poll',
        description: 'Take the poll and see the results.',
        canBeTriggeredMultipleTimes: true,
        WrapperComponent: null,
      },
      {
        actionType: UserActionType.POLL,
        campaignName: GBUserActionPollCampaignName.ENCOURAGE,
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
    description: 'Follow us on LinkedIn and stay up to date on crypto policy changes in the UK.',
    mobileCTADescription:
      'Follow us on LinkedIn and stay up to date on crypto policy changes in the UK.',
    campaignsModalDescription:
      'Follow us on LinkedIn and stay up to date on crypto policy changes in the UK.',
    image: '/gb/actionTypeIcons/follow-linkedin.png',
    campaigns: [
      {
        actionType: UserActionType.LINKEDIN,
        campaignName: GBUserActionLinkedInCampaignName.DEFAULT,
        isCampaignActive: true,
        title: 'Follow us on LinkedIn',
        description:
          'Follow us on LinkedIn and stay up to date on crypto policy changes in the UK.',
        canBeTriggeredMultipleTimes: true,
        WrapperComponent: ({ children }) => (
          <UserActionFormFollowLinkedInDialog countryCode={countryCode}>
            {children}
          </UserActionFormFollowLinkedInDialog>
        ),
      },
    ],
  },
}
