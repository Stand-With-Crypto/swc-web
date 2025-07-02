import {
  getConstituentIntroduction,
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

export const DIALOG_TITLE = 'Email your MP to stop unfair debanking'

export const DIALOG_SUBTITLE = 'Urge them to stand up for financial access and innovation.'

function getEmailBodyText(props?: GetTextProps & { address?: string }) {
  const fullNameSignOff = getFullNameSignOff({
    firstName: props?.firstName,
    lastName: props?.lastName,
  })
  const maybeDistrictIntro = getConstituentIntroduction(props?.location)

  return `${getRepIntro({ dtsiLastName: props?.dtsiLastName })}\n\n${maybeDistrictIntro}, and I wanted to write to you about the issue of unfair debanking in Australia.\n\nAccess to financial services is essential for innovation and economic growth. Unfair debanking practices threaten the future of crypto and financial access for all Australians.\n\nI urge you to stand up for financial access and innovation, and to support policies that ensure fair treatment for everyone.\n\nThank you for your attention to this important issue.${fullNameSignOff}`
}

export const campaignMetadata: CampaignMetadata = {
  campaignName: CAMPAIGN_NAME,
  dialogTitle: `Email your ${getYourPoliticianCategoryShortDisplayName('house-of-reps')}`,
  dialogSubtitle: 'You emailed your MP to stop unfair debanking.',
  politicianCategory: 'house-of-reps',
  subject: 'Stop Unfair Debanking in Australia',
  getEmailBodyText,
}
