import { UserActionType } from '@prisma/client'

import {
  UserActionFormEmailCongresspersonDialog,
  type UserActionFormEmailCongresspersonDialogProps,
} from '@/components/app/userActionFormEmailCongressperson/dialog'
import {
  getConstituentIntroduction,
  getFullNameSignOff,
  getRepIntro,
  GetTextProps,
} from '@/components/app/userActionFormEmailCongressperson/emailBodyUtils'
import { UserActionGridCTACampaign } from '@/components/app/userActionGridCTAs/types'
import { USUserActionEmailCampaignName } from '@/utils/shared/userActionCampaigns/us/usUserActionCampaigns'
import {
  getYourPoliticianCategoryShortDisplayName,
  YourPoliticianCategory,
} from '@/utils/shared/yourPoliticianCategory'

import type { CampaignMetadata } from '.'

export const EMAIL_FLOW_POLITICIANS_CATEGORY: YourPoliticianCategory = 'house'

export const DIALOG_TITLE = 'Email Your Member of Congress'

export const DIALOG_SUBTITLE = 'Support Crucial Crypto Legislation'

function getEmailBodyText(props?: GetTextProps & { address?: string }) {
  const fullNameSignOff = getFullNameSignOff({
    firstName: props?.firstName,
    lastName: props?.lastName,
  })
  const maybeDistrictIntro = getConstituentIntroduction(props?.location)

  return `${getRepIntro({ dtsiLastName: props?.dtsiLastName })}\n\n${maybeDistrictIntro}, and I wanted to write to you and let you know that I care about crypto and blockchain technology.\n\nLike the other 52 million Americans who own crypto, I know that this technology can unlock the creation of millions of jobs in the U.S. and ensure America remains a global leader in technology. That’s good for our economic and national security.\n\nCrypto needs clear rules, regulations, and guidelines to thrive in America, and we need members of Congress like you to champion this powerful technology so that it can reach its full potential. If crypto doesn’t succeed in America, then jobs, innovation, and new technologies will be driven overseas and our country will miss out on the massive benefits.\n\nI hope that you will keep the views of pro-crypto constituents like myself in mind as you carry on your work in Congress.${fullNameSignOff}`
}

export const campaignMetadata: CampaignMetadata = {
  campaignName: USUserActionEmailCampaignName.DEFAULT,
  dialogTitle: `Email your ${getYourPoliticianCategoryShortDisplayName('house')}`,
  dialogSubtitle: 'You emailed your representative about FIT21.',
  politicianCategory: 'house',
  subject: 'Support Crypto Legislation',
  getEmailBodyText,
}

const WrapperComponent = (
  props: Omit<UserActionFormEmailCongresspersonDialogProps, 'campaignName'>,
) => (
  <UserActionFormEmailCongresspersonDialog
    {...props}
    campaignName={USUserActionEmailCampaignName.DEFAULT}
  />
)

export const campaignCTAConfig: UserActionGridCTACampaign = {
  actionType: UserActionType.EMAIL,
  campaignName: USUserActionEmailCampaignName.DEFAULT,
  isCampaignActive: false,
  title: `Email your ${getYourPoliticianCategoryShortDisplayName('house')}`,
  description: 'You emailed your representative about FIT21.',
  canBeTriggeredMultipleTimes: true,
  WrapperComponent,
}
