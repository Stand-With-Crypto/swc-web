import { USUserActionEmailCampaignName } from '@/utils/shared/userActionCampaigns/us/usUserActionCampaigns'
import { YourPoliticianCategory } from '@/utils/shared/yourPoliticianCategory/us'

import type { CampaignMetadata } from './types'

const CAMPAIGN_NAME = USUserActionEmailCampaignName.CLARITY_ACT_SENATE_JUL_17_2025

export const EMAIL_FLOW_POLITICIANS_CATEGORY: YourPoliticianCategory = 'senate'

function getEmailBodyText() {
  return `On behalf of more than 52 million American crypto owners and counting—I urge you to support the Digital Asset Market Structure Clarity (CLARITY) Act (H.R. 3633), which would establish a clear, common-sense regulatory framework for digital assets—one that protects consumers, fosters innovation, and ensures the U.S. remains a global economic leader.

For too long, innovators in the crypto industry have had to navigate a patchwork of outdated regulations never intended for blockchain technology. This lack of clarity hasn’t just stifled innovation—it’s hindered broader U.S. economic growth. Since 2018, the U.S. share of global blockchain developers has dropped by approximately 14%, falling to just 26% in 2023. Regulatory uncertainty has pushed developers overseas, discouraged businesses from embracing blockchain, and limited opportunities for financial inclusion. Most critically, it has left consumers vulnerable to fraud  instability and systemic risk in the digital asset markets.

Critics argue that crypto doesn’t play by the rules—but how can it, when no clear federal market structure rules exist? It’s time to fix that—not just to support entrepreneurs and innovators, but to protect and empower American consumers.

The CLARITY Act provides this fix. It outlines responsibilities between federal agencies, establishes a clear registration process for crypto businesses, and safeguards key consumer rights like self-custody and the freedom to transact. This bill is a meaningful step toward ensuring digital asset innovation happens here—under U.S. law and guided by American values.

Members of Congress from both parties have shown a commitment to establishing the clear rules of the road needed to unlock the crypto industry’s potential. I ask that you help maintain this momentum by supporting the CLARITY Act.

Thank you for helping to advance responsible American innovation.`
}

export const campaignMetadata: CampaignMetadata = {
  campaignName: CAMPAIGN_NAME,
  dialogTitle: 'Email Your Senator',
  dialogSubtitle: 'Support the CLARITY Act in the Senate',
  politicianCategory: EMAIL_FLOW_POLITICIANS_CATEGORY,
  subject: 'I SUPPORT CLARITY',
  getEmailBodyText,
}
