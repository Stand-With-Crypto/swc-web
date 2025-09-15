import { UserActionType } from '@prisma/client'

import { LoginDialogWrapper } from '@/components/app/authentication/loginDialogWrapper'
import { UserActionGridCTA } from '@/components/app/userActionGridCTAs/types'
import { UserActionOptInCampaignName } from '@/utils/shared/userActionCampaigns/common'

export const EU_USER_ACTION_CTAS_FOR_GRID_DISPLAY: UserActionGridCTA = {
  [UserActionType.OPT_IN]: {
    title: 'Join Stand With Crypto EU',
    description: `Join the movement to make your voice heard.`,
    mobileCTADescription: 'Join the movement to make your voice heard.',
    campaignsModalDescription: `Join the movement to make your voice heard.`,
    image: '/actionTypeIcons/optIn.png',
    campaigns: [
      {
        actionType: UserActionType.OPT_IN,
        campaignName: UserActionOptInCampaignName.DEFAULT,
        isCampaignActive: true,
        title: 'Join Stand With Crypto EU',
        description: `Join the movement to make your voice heard.`,
        canBeTriggeredMultipleTimes: false,
        WrapperComponent: ({ children }) => (
          <LoginDialogWrapper authenticatedContent={children}>{children}</LoginDialogWrapper>
        ),
      },
    ],
  },
  // TODO(EU): Add more action types when EU campaigns are implemented
}
