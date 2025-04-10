import { UserActionType } from '@prisma/client'
import Link from 'next/link'

import { LoginDialogWrapper } from '@/components/app/authentication/loginDialogWrapper'
import { UserActionFormReferDialog } from '@/components/app/userActionFormRefer/dialog'
import { UserActionFormShareOnTwitterDialog } from '@/components/app/userActionFormShareOnTwitter/common/dialog'
import { UserActionGridCTA } from '@/components/app/userActionGridCTAs/types'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { getIntlUrls } from '@/utils/shared/urls'
import { UserActionOptInCampaignName } from '@/utils/shared/userActionCampaigns/common'
import {
  GBUserActionReferCampaignName,
  GBUserActionTweetCampaignName,
  GBUserActionViewKeyPageCampaignName,
} from '@/utils/shared/userActionCampaigns/gb/gbUserActionCampaigns'

const countryCode = SupportedCountryCodes.GB

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
    title: 'Email your Member of Parliament',
    description: 'Make your voice heard – and write to your MP',
    campaignsModalDescription: 'Make your voice heard – and write to your MP',
    image: '/gb/actionTypeIcons/email.png',
    campaigns: [
      {
        actionType: UserActionType.VIEW_KEY_PAGE,
        campaignName: GBUserActionViewKeyPageCampaignName.NEWMODE_EMAIL_ACTION,
        isCampaignActive: false,
        title: 'Email your Member of Parliament',
        description: 'Email your MP today and call for urgent action to stop unfair debanking.',
        canBeTriggeredMultipleTimes: true,
        WrapperComponent: ({ children }) => (
          <Link href={getIntlUrls(countryCode).newmodeDebankingAction()}>{children}</Link>
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
}
