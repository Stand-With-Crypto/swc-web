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

const CAMPAIGN_NAME = AUUserActionEmailCampaignName.AU_Q2_2025_ELECTION

export const EMAIL_FLOW_POLITICIANS_CATEGORY: YourPoliticianCategory = 'house-of-reps'

function getEmailBodyText(props?: GetTextProps & { address?: string }) {
  const fullNameSignOff = getFullNameSignOff({
    firstName: props?.firstName,
    lastName: props?.lastName,
  })

  return `${getRepIntro({ dtsiLastName: props?.dtsiLastName })}\n\nAs a voter in your electorate, I’m writing to express my strong support for crypto and blockchain innovation in Australia. This industry represents a major opportunity for economic growth, job creation, and financial inclusion.\n\nOther countries are moving forward with smart, balanced regulations that foster innovation while protecting consumers. Australia must do the same—or risk losing talent and investment to more forward-thinking jurisdictions.\n\nI’m supporting candidates who understand the importance of crypto and will champion policies that allow the industry to thrive responsibly here. I urge you to take a clear stance on this issue.${fullNameSignOff}`
}

export const campaignMetadata: CampaignMetadata = {
  campaignName: CAMPAIGN_NAME,
  dialogTitle: `Email your ${getYourPoliticianCategoryShortDisplayName('house-of-reps')}`,
  dialogSubtitle: 'You emailed your MP about supporting responsible crypto policy.',
  politicianCategory: 'house-of-reps',
  subject: 'Support Responsible Crypto Policy',
  getEmailBodyText,
}
