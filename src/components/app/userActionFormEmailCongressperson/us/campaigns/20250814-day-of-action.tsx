import {
  getFullNameSignOff,
  getRepIntro,
  GetTextProps,
} from '@/components/app/userActionFormEmailCongressperson/common/emailBodyUtils'
import { USUserActionEmailCampaignName } from '@/utils/shared/userActionCampaigns/us/usUserActionCampaigns'
import { YourPoliticianCategory } from '@/utils/shared/yourPoliticianCategory/us'

import type { CampaignMetadata } from './types'

const CAMPAIGN_NAME = USUserActionEmailCampaignName.DAY_OF_ACTION_AUG_14_2025

export const EMAIL_FLOW_POLITICIANS_CATEGORY: YourPoliticianCategory = 'senate-and-house'

function getEmailBodyText(props?: GetTextProps & { address?: string }) {
  const fullNameSignOff = getFullNameSignOff({
    firstName: props?.firstName,
    lastName: props?.lastName,
  })

  const representativeName = getRepIntro({ dtsiLastName: props?.dtsiLastName })

  return `${representativeName}

August 14 is the Crypto Day of Action—a day when Americans across the country are coming together to call for clear, common-sense crypto policy that will make America the crypto capital of the world.

More than 52 million Americans own crypto, and millions more understand its power to unlock economic opportunity, expand financial access, and strengthen America’s competitiveness on the global stage. Crypto is already reshaping how Americans build, save, and connect—but the lack of a regulatory framework and “clear rules of the road” is stifling our ability to leverage crypto to its full potential and fuel responsible innovation here at home.

Without urgent action from our elected leaders, the U.S. risks falling behind. Developers are already moving overseas. Consumers remain vulnerable. And our ability to lead in the next wave of digital innovation is slipping away. While Congress has made important progress by advancing the bipartisan GENIUS Act, what’s missing is a comprehensive market structure bill. The CLARITY Act, which passed the House with bipartisan support earlier this summer, is both a step in the right direction and proof that crypto policy isn’t a partisan fight—it’s a national priority. We need the Senate to join the House by prioritizing market structure legislation. 

Crypto isn’t going away and voters who care about crypto are organizing across party lines in every state to call for thoughtful, forward-looking policy that protects consumers, supports innovation, and preserves American leadership. When Congress reconvenes this fall, I urge you to help ensure the U.S. doesn’t pass up this opportunity to lead the next chapter of the global economy. 

Thank you for listening to the U.S. crypto community on this week’s Crypto Day of Action. I hope to see you standing with us.${fullNameSignOff}`
}

export const campaignMetadata: CampaignMetadata = {
  campaignName: CAMPAIGN_NAME,
  dialogTitle: 'Email your policymaker',
  dialogSubtitle: 'Crypto Day of Action',
  politicianCategory: 'senate-and-house',
  subject: 'I Stand With Crypto',
  getEmailBodyText,
}
