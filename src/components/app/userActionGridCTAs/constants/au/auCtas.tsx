import { UserActionType } from '@prisma/client'

import { LoginDialogWrapper } from '@/components/app/authentication/loginDialogWrapper'
import { UserActionFormReferDialog } from '@/components/app/userActionFormRefer/dialog'
import {
  UserActionFormShareOnTwitterDialog,
  UserActionViewKeyPageDialog,
} from '@/components/app/userActionFormShareOnTwitter/common/dialog'
import { UserActionGridCTA } from '@/components/app/userActionGridCTAs/types'
import { TOTAL_CRYPTO_ADVOCATE_COUNT_DISPLAY_NAME } from '@/utils/shared/constants'
import { COUNTRY_CODE_TO_DISPLAY_NAME } from '@/utils/shared/intl/displayNames'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { getIntlUrls } from '@/utils/shared/urls'
import {
  AUUserActionReferCampaignName,
  AUUserActionTweetCampaignName,
  AUUserActionViewKeyPageCampaignName,
} from '@/utils/shared/userActionCampaigns/au/auUserActionCampaigns'
import { UserActionOptInCampaignName } from '@/utils/shared/userActionCampaigns/common'

const countryCode = SupportedCountryCodes.AU

export const AU_USER_ACTION_CTAS_FOR_GRID_DISPLAY: UserActionGridCTA = {
  [UserActionType.OPT_IN]: {
    title: 'Join Stand With Crypto Australia',
    description: `Join the Movement with over ${TOTAL_CRYPTO_ADVOCATE_COUNT_DISPLAY_NAME} advocates supporting crypto in ${COUNTRY_CODE_TO_DISPLAY_NAME[countryCode]}.`,
    mobileCTADescription: 'Join the Movement to keep crypto in Australia.',
    campaignsModalDescription: `Join the Movement with over ${TOTAL_CRYPTO_ADVOCATE_COUNT_DISPLAY_NAME} advocates supporting crypto in ${COUNTRY_CODE_TO_DISPLAY_NAME[countryCode]}.`,
    image: '/au/actionTypeIcons/opt-in.png',
    campaigns: [
      {
        actionType: UserActionType.OPT_IN,
        campaignName: UserActionOptInCampaignName.DEFAULT,
        isCampaignActive: true,
        title: 'Join Stand With Crypto Australia',
        description: `Join the Movement with over ${TOTAL_CRYPTO_ADVOCATE_COUNT_DISPLAY_NAME} advocates supporting crypto in ${COUNTRY_CODE_TO_DISPLAY_NAME[countryCode]}.`,
        canBeTriggeredMultipleTimes: false,
        WrapperComponent: ({ children }) => (
          <LoginDialogWrapper authenticatedContent={children}>{children}</LoginDialogWrapper>
        ),
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
  [UserActionType.VIEW_KEY_PAGE]: {
    title: 'Email your Member of Parliament',
    description:
      'Tell your Member of Parliament to support responsible crypto policy—send an email now!',
    campaignsModalDescription:
      'Tell your Member of Parliament to support responsible crypto policy—send an email now!',
    image: '/au/actionTypeIcons/email.png',
    campaigns: [
      {
        actionType: UserActionType.VIEW_KEY_PAGE,
        campaignName: AUUserActionViewKeyPageCampaignName.AU_Q2_2025_ELECTION,
        isCampaignActive: true,
        title: `Email your Member of Parliament`,
        description:
          'You’ve emailed your Member of Parliament and called for responsible crypto policy.',
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
    image: '/au/actionTypeIcons/refer.png',
    campaigns: [
      {
        actionType: UserActionType.REFER,
        campaignName: AUUserActionReferCampaignName.DEFAULT,
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
