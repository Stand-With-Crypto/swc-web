import { UserActionType } from '@prisma/client'

import { UserActionFormShareOnTwitterDialog } from '@/components/app/userActionFormShareOnTwitter/common/dialog'
import { UserActionCTA } from '@/components/app/userActionGridCTAs/types'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { UserActionCampaignNames } from '@/utils/shared/userActionCampaigns'

interface GetDefaultTweetCTAParams {
  countryCode: SupportedCountryCodes
  campaignName: UserActionCampaignNames
}

export function getDefaultTweetCTA({
  countryCode,
  campaignName,
}: GetDefaultTweetCTAParams): UserActionCTA {
  return {
    title: 'Follow us on X',
    description: 'Stay up to date on crypto policy by following @StandWithCrypto on X.',
    mobileCTADescription: 'Stay up to date on crypto policy.',
    campaignsModalDescription:
      'Stay up to date on crypto policy by following @StandWithCrypto on X.',
    image: '/actionTypeIcons/tweet.png',
    campaigns: [
      {
        actionType: UserActionType.TWEET,
        campaignName,
        isCampaignActive: true,
        title: 'Follow us on X',
        description: 'Stay up to date on crypto policy by following @StandWithCrypto on X.',
        canBeTriggeredMultipleTimes: true,
        WrapperComponent: ({ children }) => (
          <UserActionFormShareOnTwitterDialog countryCode={countryCode}>
            {children}
          </UserActionFormShareOnTwitterDialog>
        ),
      },
    ],
  }
}
