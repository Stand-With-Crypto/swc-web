import {
  getFullNameSignOff,
  GetTextProps,
} from '@/components/app/userActionFormEmailCongressperson/common/emailBodyUtils'
import { GBUserActionEmailCampaignName } from '@/utils/shared/userActionCampaigns/gb/gbUserActionCampaigns'
import {
  getYourPoliticianCategoryShortDisplayName,
  YourPoliticianCategory,
} from '@/utils/shared/yourPoliticianCategory/gb'

import type { CampaignMetadata } from './types'

const CAMPAIGN_NAME = GBUserActionEmailCampaignName.STABLECOINS

export const EMAIL_FLOW_POLITICIANS_CATEGORY: YourPoliticianCategory = 'mp'

export const DIALOG_TITLE = 'Email Your MP'

export const DIALOG_SUBTITLE = 'Support Stablecoins'

function getEmailBodyText(props?: GetTextProps & { address?: string }) {
  const fullNameSignOff = getFullNameSignOff({
    firstName: props?.firstName,
    lastName: props?.lastName,
  })

  return `Dear Member of Parliament,

As your constituent, I am writing to let you know that I have signed a petition calling on the UK Government to ‘Stop retail CBDCs and deliver a Blockchain Action Plan with Stablecoins at its Core’.

Successive Governments have pledged to make the UK a global centre of digital asset innovation, but this ambition is yet to be turned into a reality. The time is now. Jurisdictions around the world are accelerating strategies to capture digital asset innovation and the economic benefits associated with this, and the UK must not sit on the sidelines.

For centuries London has been the centre of global trade and finance and has a proud history of international leadership when it comes to new settlement systems - Forex, Repo and Eurobond markets are all dominated by the City of London. But the future is digital and tokenised, where equities, bonds and real world assets exist as tokens - tradeable 24/7, instantly around the world. The UK must show renewed leadership to capture this innovation in global financial markets.

To deliver on its tokenisation strategy, the US has already ruled out CBDCs and is leaning into stablecoins as the preferred settlement asset. But the UK is yet to decide whether it will pursue stablecoins, CBDCs or tokenised deposits. The UK is at a crossroads; it must lead from the front to capitalise on this tokenised future and show stablecoin leadership. This is a question of national interest to preserve the competitiveness of the City and the pound’s standing in the world.

As my elected representative, I urge you to:

	• Write to Emma Reynolds, the City Minister, calling for the Government to:
		a)   Set out a Blockchain Action Plan with a stablecoin strategy.
		b)   Drive a pro-innovation stablecoin and tokenisation regime, e.g. permit interest-bearing stablecoins and preserve their role as wholesale settlement asset.
		c)   Explore Govt use cases for blockchain
		d)   Appoint a blockchain and crypto Tsar

	• Table a Parliamentary Question to press the Government to deliver a Blockchain Action Plan, centred on fostering stablecoin adoption.

Thank you for taking the time to consider these requests and I look forward to hearing from you in due course.${fullNameSignOff}`
}

export const campaignMetadata: CampaignMetadata = {
  campaignName: CAMPAIGN_NAME,
  dialogTitle: `Email your ${getYourPoliticianCategoryShortDisplayName('mp')}`,
  dialogSubtitle: 'You emailed your MP about crypto.',
  politicianCategory: 'mp',
  subject: 'Support Crypto Legislation',
  getEmailBodyText,
}
