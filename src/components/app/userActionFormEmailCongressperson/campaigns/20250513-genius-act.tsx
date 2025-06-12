import {
  getFullNameSignOff,
  GetTextProps,
} from '@/components/app/userActionFormEmailCongressperson/emailBodyUtils'
import { USUserActionEmailCampaignName } from '@/utils/shared/userActionCampaigns/us/usUserActionCampaigns'

import type { CampaignMetadata } from './types'

const CAMPAIGN_NAME = USUserActionEmailCampaignName.GENIUS_ACT_MAY_13_2025

function getEmailBodyText(props?: GetTextProps & { address?: string }) {
  const fullNameSignOff = getFullNameSignOff({
    firstName: props?.firstName,
    lastName: props?.lastName,
  })

  return `As a Stand With Crypto Advocate and your constituent, I am one of the tens of millions of Americans who own, build, or develop with cryptocurrencies and blockchain technology. On behalf of the broader crypto community, I urge you to support the Guiding and Establishing National Innovation for U.S. Stablecoins (GENIUS) Act.

In order for the U.S. to realize the full potential of stablecoins, we must foster a regulatory environment that encourages the growth of the crypto industry while ensuring the protection of consumers like myself. The GENIUS Act has the potential to provide clear guidelines and standards for stablecoin regulation, helping to enhance the efficiency of our financial system and maintain U.S. leadership in digital asset innovation.

In the past, you’ve shown commitment to thoughtful and forward-looking legislation, and as one of your constituents I am grateful to you for moving America forward. By supporting the GENIUS Act, you have the opportunity to show this commitment once again.

When you stand with crypto, you stand with millions of Americans across the country. Thank you.${fullNameSignOff}`
}

export const campaignMetadata: CampaignMetadata = {
  campaignName: CAMPAIGN_NAME,
  dialogTitle: 'Email Your Senator',
  dialogSubtitle: 'Support Crucial Crypto Legislation',
  politicianCategory: 'senate',
  subject: 'Support GENIUS Act',
  getEmailBodyText,
}
