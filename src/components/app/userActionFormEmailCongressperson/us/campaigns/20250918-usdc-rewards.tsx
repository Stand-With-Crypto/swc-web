import {
  getFullNameSignOff,
  GetTextProps,
} from '@/components/app/userActionFormEmailCongressperson/common/emailBodyUtils'
import { USUserActionEmailCampaignName } from '@/utils/shared/userActionCampaigns/us/usUserActionCampaigns'
import {
  getYourPoliticianCategoryShortDisplayName,
  YourPoliticianCategory,
} from '@/utils/shared/yourPoliticianCategory/us'

import type { CampaignMetadata } from './types'

const CAMPAIGN_NAME = USUserActionEmailCampaignName.USDC_REWARDS_SEP_18_2025

export const EMAIL_FLOW_POLITICIANS_CATEGORY: YourPoliticianCategory = 'senate'

function getEmailBodyText(props?: GetTextProps) {
  const fullNameSignOff = getFullNameSignOff({
    firstName: props?.firstName,
    lastName: props?.lastName,
  })

  return `Dear Senator

Thank you for all the progress that Congress has made in providing rules of the road for digital assets, allowing for responsible innovation and growth while also protecting consumers. First, with huge bipartisan support, the GENIUS Act was signed into law. And the House recently advanced CLARITY, digital asset market structure legislation that also has strong bipartisan support. 

But now, the big banks are asking Congress to reverse law by bailing them out, not because they want to protect consumers, but because they want to stifle competition. 
You and your colleagues already litigated this issue when Congress passed GENIUS. Lawmakers chose to protect rewards because you know they are for consumers. A ban on rewards would stop consumers from earning value on fully backed digital dollars, even as banks lobbied to protect their credit card rewards as recently as last year.

Rewards programs mean more innovation and better financial products for everyday Americans. They’re transparent, automated, and give consumers a fairer return on their money. Banks want a bailout, not competition, but consumers deserve choice. 

I am your constituent and I am asking you to reject efforts by the banks to ban rewards. Don’t legislate away consumer choice. We need you to level the playing field so that both banks and digital asset firms can innovate, compete, and deliver value for consumers.${fullNameSignOff}`
}

export const campaignMetadata: CampaignMetadata = {
  campaignName: CAMPAIGN_NAME,
  dialogTitle: `Email your ${getYourPoliticianCategoryShortDisplayName(EMAIL_FLOW_POLITICIANS_CATEGORY)}`,
  dialogSubtitle: 'Tell them to protect YOUR rewards',
  politicianCategory: 'senate',
  subject: "Protect My Rewards - Don't Legislate Away Consumer Choice",
  getEmailBodyText,
}
