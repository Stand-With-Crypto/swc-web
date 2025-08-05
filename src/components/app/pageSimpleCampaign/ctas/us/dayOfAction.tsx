import { UserActionType } from '@prisma/client'

import { getDefaultReferCTA } from '@/components/app/pageSimpleCampaign/ctas/commons/refer'
import { getDefaultTweetCTA } from '@/components/app/pageSimpleCampaign/ctas/commons/tweet'
import { getEmailActionWrapperComponentByCampaignName } from '@/components/app/userActionFormEmailCongressperson/getWrapperComponentByCampaignName'
import { UserActionGridCTA } from '@/components/app/userActionGridCTAs/types'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import {
  USUserActionEmailCampaignName,
  USUserActionReferCampaignName,
  USUserActionTweetCampaignName,
} from '@/utils/shared/userActionCampaigns/us/usUserActionCampaigns'

const countryCode = SupportedCountryCodes.US

export const US_DAY_OF_ACTION_CTAS: UserActionGridCTA = {
  [UserActionType.TWEET]: getDefaultTweetCTA({
    campaignName: USUserActionTweetCampaignName.FOLLOW_SWC_ON_X_2024,
    countryCode,
  }),
  [UserActionType.EMAIL]: {
    title: 'Email your policymaker',
    description: 'Pass crucial crypto legislation',
    campaignsModalDescription:
      'One of the most effective ways of making your voice heard. We’ve drafted emails to make it easy for you.',
    image: '/actionTypeIcons/email.png',
    campaigns: [
      {
        actionType: UserActionType.EMAIL,
        campaignName: USUserActionEmailCampaignName.DAY_OF_ACTION_AUG_14_2025,
        isCampaignActive: true,
        title: 'Email Your Senator',
        description: 'Support Crucial Crypto Legislation',
        canBeTriggeredMultipleTimes: true,
        WrapperComponent: getEmailActionWrapperComponentByCampaignName({
          countryCode,
          campaignName: USUserActionEmailCampaignName.DAY_OF_ACTION_AUG_14_2025,
        }),
      },
    ],
  },
  [UserActionType.REFER]: getDefaultReferCTA({
    campaignName: USUserActionReferCampaignName.DEFAULT,
    countryCode,
  }),
}
