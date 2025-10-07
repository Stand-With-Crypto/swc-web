import {
  getFullNameSignOff,
  getRepIntro,
  GetTextProps,
} from '@/components/app/userActionFormEmailCongressperson/common/emailBodyUtils'
import { AUUserActionEmailCampaignName } from '@/utils/shared/userActionCampaigns/au/auUserActionCampaigns'
import { YourPoliticianCategory } from '@/utils/shared/yourPoliticianCategory/au'

import type { CampaignMetadata } from './types'

const CAMPAIGN_NAME = AUUserActionEmailCampaignName.PROTECT_CRYPTO_INNOVATION_2025

export const EMAIL_FLOW_POLITICIANS_CATEGORY: YourPoliticianCategory = 'house-of-reps'

function getEmailBodyText(props?: GetTextProps & { address?: string }) {
  const { firstName, lastName, dtsiLastName } = props || {}

  const fullNameSignOff = getFullNameSignOff({
    firstName: props?.firstName,
    lastName: props?.lastName,
  })

  const repIntro = getRepIntro({ dtsiLastName: dtsiLastName })
  const advocateName = [firstName, lastName].filter(Boolean).join(' ').trim()
  const maybeAdvocateIntro = advocateName ? `My name is ${advocateName}, and ` : ''

  return `${repIntro}
${maybeAdvocateIntro} I am one of your constituents. I'm writing to you about Regulating digital asset platforms - exposure draft legislation that has recently been released by the Government. This legislation is important for our industry, bringing some clarity and protections that are the norm most places around the world. I urge you to give it some time so it may be passed quickly after it is introduced into parliament, late this year or early next.

As a voter in your electorate, and one of more than 4 million Australians that own, build, or develop crypto, digital assets and blockchain technology, I urge you to support and prioritise digital asset and stablecoin reforms. While often associated with finance, this technology offers far broader benefits, from secure digital identity to more efficient public services. It's a tool that can help boost productivity, support entrepreneurs, and strengthen consumer trust.

This technology offers significant potential for not only Australia, but also our electorate in terms of jobs, economic growth and even financial inclusivity.

Other countries are already moving to integrate blockchain into their innovation plans.
Australia has the talent and values to lead in this space if we take thoughtful steps forward.

I support candidates who prioritise responsible crypto policies and encourage you to champion this transformative industry.

Thank you for your consideration.${fullNameSignOff}`
}

export const campaignMetadata: CampaignMetadata = {
  campaignName: CAMPAIGN_NAME,
  dialogTitle: `Email your MP`,
  dialogSubtitle: 'Advocate for crypto reforms',
  politicianCategory: 'house-of-reps',
  subject: 'Protect Crypto Innovation',
  getEmailBodyText,
}
