import { UserActionType } from '@prisma/client'
import Link from 'next/link'

import { LoginDialogWrapper } from '@/components/app/authentication/loginDialogWrapper'
import { UserActionFormShareOnTwitterDialog } from '@/components/app/userActionFormShareOnTwitter/common/dialog'
import { UserActionGridCTA } from '@/components/app/userActionGridCTAs/types'
import { TOTAL_CRYPTO_ADVOCATE_COUNT_DISPLAY_NAME } from '@/utils/shared/constants'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { getIntlUrls } from '@/utils/shared/urls'
import { UserActionOptInCampaignName } from '@/utils/shared/userActionCampaigns/common'
import {
  GBUserActionTweetCampaignName,
  GBUserActionViewKeyPageCampaignName,
} from '@/utils/shared/userActionCampaigns/gb/gbUserActionCampaigns'

export const GB_USER_ACTION_CTAS_FOR_GRID_DISPLAY: UserActionGridCTA = {
  [UserActionType.OPT_IN]: {
    title: 'Join Stand With Crypto',
    description: `Join over ${TOTAL_CRYPTO_ADVOCATE_COUNT_DISPLAY_NAME} advocates fighting to keep crypto in United Kingdom.`,
    mobileCTADescription: 'Join the fight to keep crypto in United Kingdom.',
    campaignsModalDescription: `Join over ${TOTAL_CRYPTO_ADVOCATE_COUNT_DISPLAY_NAME} advocates fighting to keep crypto in United Kingdom.`,
    image: '/gb/actionTypeIcons/opt-in.png',
    campaigns: [
      {
        actionType: UserActionType.OPT_IN,
        campaignName: UserActionOptInCampaignName.DEFAULT,
        isCampaignActive: true,
        title: 'Join Stand With Crypto',
        description: `Join over ${TOTAL_CRYPTO_ADVOCATE_COUNT_DISPLAY_NAME} advocates fighting to keep crypto in United Kingdom.`,
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
          <UserActionFormShareOnTwitterDialog countryCode={SupportedCountryCodes.GB}>
            {children}
          </UserActionFormShareOnTwitterDialog>
        ),
      },
    ],
  },
  [UserActionType.VIEW_KEY_PAGE]: {
    title: 'Contact your representative',
    description:
      'One of the most effective ways of making your voice heard. We’ve drafted emails to make it easy for you.',
    campaignsModalDescription:
      'One of the most effective ways of making your voice heard. We’ve drafted emails to make it easy for you.',
    image: '/gb/actionTypeIcons/email.png',
    campaigns: [
      {
        actionType: UserActionType.VIEW_KEY_PAGE,
        campaignName: GBUserActionViewKeyPageCampaignName.NEWMODE_EMAIL_ACTION,
        isCampaignActive: true,
        title: `Email your representative`,
        description:
          'One of the most effective ways of making your voice heard. We’ve drafted emails to make it easy for you.',
        canBeTriggeredMultipleTimes: true,
        WrapperComponent: ({ children }) => (
          <Link href={getIntlUrls(SupportedCountryCodes.GB).newmodeEmailAction()}>{children}</Link>
        ),
      },
    ],
  },
}
