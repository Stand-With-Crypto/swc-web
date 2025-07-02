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

const CAMPAIGN_NAME = AUUserActionEmailCampaignName.AU_Q2_2025_ELECTION

export const EMAIL_FLOW_POLITICIANS_CATEGORY: YourPoliticianCategory = 'house-of-reps'

export const DIALOG_TITLE = 'Email your Member of Parliament'

export const DIALOG_SUBTITLE =
  'Tell your MP to support responsible crypto policy — send an email now!'

function getEmailBodyText(props?: GetTextProps & { address?: string }) {
  const fullNameSignOff = getFullNameSignOff({
    firstName: props?.firstName,
    lastName: props?.lastName,
  })
  const maybeDistrictIntro = getConstituentIntroduction(props?.location)

  return `${getRepIntro({ dtsiLastName: props?.dtsiLastName })}\n\n${maybeDistrictIntro}, and I wanted to write to you and let you know that I care about crypto and blockchain technology.\n\nCrypto needs clear rules, regulations, and guidelines to thrive in Australia, and we need members of Parliament like you to champion this powerful technology so that it can reach its full potential. If crypto doesn't succeed in Australia, then jobs, innovation, and new technologies will be driven overseas and our country will miss out on the massive benefits.\n\nI hope that you will keep the views of pro-crypto constituents like myself in mind as you carry on your work in Parliament.${fullNameSignOff}`
}

export const campaignMetadata: CampaignMetadata = {
  campaignName: CAMPAIGN_NAME,
  dialogTitle: `Email your ${getYourPoliticianCategoryShortDisplayName('house-of-reps')}`,
  dialogSubtitle: 'You emailed your MP about supporting responsible crypto policy.',
  politicianCategory: 'house-of-reps',
  subject: 'Support Responsible Crypto Policy',
  getEmailBodyText,
}
