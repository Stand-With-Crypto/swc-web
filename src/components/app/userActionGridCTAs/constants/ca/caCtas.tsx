import { UserActionType } from '@prisma/client'

import { LoginDialogWrapper } from '@/components/app/authentication/loginDialogWrapper'
import { UserActionFormReferDialog } from '@/components/app/userActionFormRefer/dialog'
import {
  UserActionFormShareOnTwitterDialog,
  UserActionViewKeyPageDialog,
} from '@/components/app/userActionFormShareOnTwitter/common/dialog'
import { UserActionGridCTA } from '@/components/app/userActionGridCTAs/types'
import { COUNTRY_CODE_TO_DISPLAY_NAME } from '@/utils/shared/intl/displayNames'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { getIntlUrls } from '@/utils/shared/urls'
import {
  CAUserActionReferCampaignName,
  CAUserActionTweetCampaignName,
  CAUserActionViewKeyPageCampaignName,
} from '@/utils/shared/userActionCampaigns/ca/caUserActionCampaigns'
import { UserActionOptInCampaignName } from '@/utils/shared/userActionCampaigns/common'

const countryCode = SupportedCountryCodes.CA
const countryDisplayName = COUNTRY_CODE_TO_DISPLAY_NAME[countryCode]

export const CA_USER_ACTION_CTAS_FOR_GRID_DISPLAY: UserActionGridCTA = {
  [UserActionType.OPT_IN]: {
    title: 'Join Stand With Crypto',
    description: `Join the movement to make ${countryDisplayName} the best crypto ecosystem in the world.`,
    mobileCTADescription: `Join the Movement for crypto in ${countryDisplayName}.`,
    campaignsModalDescription: `Join the movement to make ${countryDisplayName} the best crypto ecosystem in the world.`,
    image: '/ca/actionTypeIcons/opt-in.png',
    campaigns: [
      {
        actionType: UserActionType.OPT_IN,
        campaignName: UserActionOptInCampaignName.DEFAULT,
        isCampaignActive: true,
        title: 'Join Stand With Crypto',
        description: `Join the movement to make ${countryDisplayName} the best crypto ecosystem in the world.`,
        canBeTriggeredMultipleTimes: false,
        WrapperComponent: ({ children }) => (
          <LoginDialogWrapper authenticatedContent={children}>{children}</LoginDialogWrapper>
        ),
      },
    ],
  },
  [UserActionType.TWEET]: {
    title: 'Follow us on X',
    description: 'Stay up to date on crypto policy by following @StandWithCryptoCA on X.',
    mobileCTADescription: 'Stay up to date on crypto policy.',
    campaignsModalDescription:
      'Stay up to date on crypto policy by following @StandWithCryptoCA on X.',
    image: '/ca/actionTypeIcons/tweet.png',
    campaigns: [
      {
        actionType: UserActionType.TWEET,
        campaignName: CAUserActionTweetCampaignName.DEFAULT,
        isCampaignActive: true,
        title: 'Follow us on X',
        description: 'Stay up to date on crypto policy by following @StandWithCryptoCA on X.',
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
    description:
      'Email your Member of Parliament today and call for action to stop unfair debanking.',
    campaignsModalDescription:
      'Email your Member of Parliament today and call for action to stop unfair debanking.',
    image: '/ca/actionTypeIcons/email.png',
    campaigns: [
      {
        actionType: UserActionType.VIEW_KEY_PAGE,
        campaignName: CAUserActionViewKeyPageCampaignName.CA_Q2_2025_ELECTION,
        isCampaignActive: true,
        title: `Email your Member of Parliament`,
        description:
          'You’ve emailed your Member of Parliament and taken action to help stop unfair debanking.',
        canBeTriggeredMultipleTimes: true,
        WrapperComponent: ({ children }) => (
          <UserActionViewKeyPageDialog
            countryCode={countryCode}
            url={getIntlUrls(countryCode).newmodeElectionAction()}
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
    image: '/ca/actionTypeIcons/refer.png',
    campaigns: [
      {
        actionType: UserActionType.REFER,
        campaignName: CAUserActionReferCampaignName.DEFAULT,
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
