import { UserActionType } from '@prisma/client'

import { LoginDialogWrapper } from '@/components/app/authentication/loginDialogWrapper'
import { UserActionFormReferDialog } from '@/components/app/userActionFormRefer/dialog'
import { UserActionCTA } from '@/components/app/userActionGridCTAs/types'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { UserActionCampaignNames } from '@/utils/shared/userActionCampaigns'

interface GetDefaultReferCTAParams {
  countryCode: SupportedCountryCodes
  campaignName: UserActionCampaignNames
}

export function getDefaultReferCTA({
  countryCode,
  campaignName,
}: GetDefaultReferCTAParams): UserActionCTA {
  return {
    title: 'Refer a friend',
    description: 'Get your friend to signup for Stand With Crypto and verify their account.',
    mobileCTADescription:
      'Get your friend to signup for Stand With Crypto and verify their account.',
    campaignsModalDescription: 'Share your referral link with friends to help grow our movement.',
    image: '/actionTypeIcons/refer.png',
    campaigns: [
      {
        actionType: UserActionType.REFER,
        campaignName,
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
  }
}
