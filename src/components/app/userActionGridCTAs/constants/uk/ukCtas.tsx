import { UserActionType } from '@prisma/client'

import { UserActionFormShareOnTwitterDialog } from '@/components/app/userActionFormShareOnTwitter/dialog'
import { UserActionGridCTA } from '@/components/app/userActionGridCTAs/types'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { UserActionTweetCampaignName } from '@/utils/shared/userActionCampaigns'

export const UK_USER_ACTION_CTAS_FOR_GRID_DISPLAY: UserActionGridCTA = {
  [UserActionType.TWEET]: {
    title: 'Follow us on X',
    description: 'Stay up to date on crypto policy by following @StandWithCrypto on X.',
    mobileCTADescription: 'Stay up to date on crypto policy.',
    campaignsModalDescription:
      'Stay up to date on crypto policy by following @StandWithCrypto on X.',
    image: '/actionTypeIcons/tweet.png',
    campaigns: [
      {
        actionType: UserActionType.TWEET,
        campaignName: UserActionTweetCampaignName.FOLLOW_SWC_ON_X_2024,
        isCampaignActive: true,
        title: 'Follow us on X',
        description: 'Stay up to date on crypto policy by following @StandWithCrypto on X.',
        canBeTriggeredMultipleTimes: true,
        WrapperComponent: ({ children }) => (
          <UserActionFormShareOnTwitterDialog countryCode={SupportedCountryCodes.GB}>
            {children}
          </UserActionFormShareOnTwitterDialog>
        ),
      },
      {
        actionType: UserActionType.TWEET,
        campaignName: UserActionTweetCampaignName.DEFAULT,
        isCampaignActive: false,
        title: 'Tweet Campaign',
        description: 'You helped bring more advocates to the cause by tweeting about SWC.',
        canBeTriggeredMultipleTimes: true,
        WrapperComponent: ({ children }) => (
          <UserActionFormShareOnTwitterDialog countryCode={SupportedCountryCodes.GB}>
            {children}
          </UserActionFormShareOnTwitterDialog>
        ),
      },
    ],
  },
}
