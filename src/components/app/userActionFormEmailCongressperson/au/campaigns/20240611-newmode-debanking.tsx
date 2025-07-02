import {
  getFullNameSignOff,
  getRepIntro,
  GetTextProps,
} from '@/components/app/userActionFormEmailCongressperson/common/emailBodyUtils'
import { AUUserActionEmailCampaignName } from '@/utils/shared/userActionCampaigns/au/auUserActionCampaigns'
import {
  getYourPoliticianCategoryShortDisplayName,
  YourPoliticianCategory,
} from '@/utils/shared/yourPoliticianCategory/au'

import type { CampaignMetadata } from './types'

const CAMPAIGN_NAME = AUUserActionEmailCampaignName.AU_NEWMODE_DEBANKING

export const EMAIL_FLOW_POLITICIANS_CATEGORY: YourPoliticianCategory = 'house-of-reps'

function getEmailBodyText(props?: GetTextProps & { address?: string }) {
  const fullNameSignOff = getFullNameSignOff({
    firstName: props?.firstName,
    lastName: props?.lastName,
  })

  return `${getRepIntro({ dtsiLastName: props?.dtsiLastName })}

I am writing to you as a concerned constituent regarding the growing issue of de-banking in Australia. Increasingly, individuals and businesses are having their bank accounts closed, or their transactions blocked and frozen without clear justification, often with little to no recourse. This troubling trend threatens financial inclusion, trust in the banking system, and fundamental democratic principles.

Access to banking services is not just a convenience—it is a necessity in modern society. Losing access to banking services can be devastating for startups and small businesses who are crucial to driving economic growth. Australia has a history of home-grown tech giants but the next great success story could be just one bank's decision away from never launching at all.

This practice disproportionately affects crypto users, businesses, and entrepreneurs. There are Australian crypto entrepreneurs building impact-driven businesses that support our nations athletes, facilitate carbon credit trading via blockchain, secure billions of dollars of on-chain assets, and provide access to critical data for our local farmers. Without access to traditional banking or with restrictive transaction limits, crypto firms are unable to reach their full innovative potential.

Will you commit to addressing de-banking in Australia? Your leadership on this issue is critical.
I look forward to hearing what concrete steps your office will take to ensure financial fairness for all Australians.${fullNameSignOff}`
}

export const campaignMetadata: CampaignMetadata = {
  campaignName: CAMPAIGN_NAME,
  dialogTitle: `Email your ${getYourPoliticianCategoryShortDisplayName('house-of-reps')}`,
  dialogSubtitle: 'You emailed your MP to stop unfair debanking.',
  politicianCategory: 'house-of-reps',
  subject: 'Stop Unfair Debanking in Australia',
  getEmailBodyText,
}
