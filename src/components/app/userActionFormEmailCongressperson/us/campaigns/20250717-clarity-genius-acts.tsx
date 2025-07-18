import {
  getFullNameSignOff,
  GetTextProps,
} from '@/components/app/userActionFormEmailCongressperson/common/emailBodyUtils'
import { USUserActionEmailCampaignName } from '@/utils/shared/userActionCampaigns/us/usUserActionCampaigns'
import { YourPoliticianCategory } from '@/utils/shared/yourPoliticianCategory/us'

import type { CampaignMetadata } from './types'

const CAMPAIGN_NAME = USUserActionEmailCampaignName.CLARITY_GENIUS_ACTS_JUL_17_2025

export const EMAIL_FLOW_POLITICIANS_CATEGORY: YourPoliticianCategory = 'house'

function getEmailBodyText(props?: GetTextProps & { address?: string }) {
  const fullNameSignOff = getFullNameSignOff({
    firstName: props?.firstName,
    lastName: props?.lastName,
  })

  return `As your constituent—I urge you to support The CLARITY Act. and The GENIUS Act. These are two crucial pieces of legislation that would establish a clear, common-sense regulatory framework for digital assets. We NEED both pieces of legislation to protect consumers, foster innovation, and ensure the U.S. remains a global economic leader.
  
For too long, innovators in the crypto industry have had to navigate a patchwork of outdated regulations never intended for blockchain technology. This lack of clarity hasn’t just stifled innovation—it’s hindered broader U.S. economic growth and put consumers at risk. We need BOTH pieces of legislation in order to protect consumers like me.
  
Critics argue that crypto doesn’t play by the rules—but how can it, when no clear rules exist? By passing the CLARITY and GENIUS Acts, we can fix that—not just to support entrepreneurs and innovators, but to protect and empower American consumers.
  
These bills outline responsibilities between federal agencies, establish a clear registration process for crypto businesses, and safeguard key consumer rights like self-custody and the freedom to transact. Passing these bills would be a meaningful step toward ensuring digital asset innovation happens here—under U.S. law and guided by American values.
  
Members of Congress from both parties have shown a commitment to establishing the clear rules of the road needed to unlock the crypto industry’s potential. I ask that you show that commitment by passing both the GENIUS and CLARITY Acts.
  
Thank you for helping to advance responsible American innovation.${fullNameSignOff}`
}

export const campaignMetadata: CampaignMetadata = {
  campaignName: CAMPAIGN_NAME,
  dialogTitle: 'Email Your House Rep',
  dialogSubtitle: 'Support CLARITY and GENIUS Acts',
  politicianCategory: 'house',
  subject: 'Support CLARITY and GENIUS Acts',
  getEmailBodyText,
}
