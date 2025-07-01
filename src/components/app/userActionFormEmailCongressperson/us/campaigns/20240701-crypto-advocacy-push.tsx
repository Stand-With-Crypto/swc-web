import {
  getConstituentIntroduction,
  getFullNameSignOff,
  getRepIntro,
  GetTextProps,
} from '@/components/app/userActionFormEmailCongressperson/common/emailBodyUtils'
import { USUserActionEmailCampaignName } from '@/utils/shared/userActionCampaigns/us/usUserActionCampaigns'
import {
  getYourPoliticianCategoryShortDisplayName,
  YourPoliticianCategory,
} from '@/utils/shared/yourPoliticianCategory/us'

import type { CampaignMetadata } from './types'

const CAMPAIGN_NAME = USUserActionEmailCampaignName.CRYPTO_ADVOCACY_PUSH_JULY_2024

export const EMAIL_FLOW_POLITICIANS_CATEGORY: YourPoliticianCategory = 'house'

export const DIALOG_TITLE = 'Email your Congressperson'

export const DIALOG_SUBTITLE = 'Push for Pro-Crypto Policies in July 2024'

function getEmailBodyText(props?: GetTextProps & { address?: string }) {
  const fullNameSignOff = getFullNameSignOff({
    firstName: props?.firstName,
    lastName: props?.lastName,
  })
  const maybeDistrictIntro = getConstituentIntroduction(props?.location)

  return `${getRepIntro({ dtsiLastName: props?.dtsiLastName })}\n\n${maybeDistrictIntro}, and I am writing to urge you to support pro-crypto policies in Congress. Blockchain technology and digital assets are vital for America's economic future, innovation, and global leadership.\n\nBy championing clear, fair regulations for crypto, you can help create jobs, foster innovation, and ensure the U.S. remains at the forefront of this technological revolution. Please consider the voices of millions of Americans who believe in the promise of crypto.\n\nThank you for your leadership and support.${fullNameSignOff}`
}

export const campaignMetadata: CampaignMetadata = {
  campaignName: CAMPAIGN_NAME,
  dialogTitle: DIALOG_TITLE,
  dialogSubtitle: DIALOG_SUBTITLE,
  politicianCategory: 'house',
  subject: 'Support Pro-Crypto Policies',
  getEmailBodyText,
}
