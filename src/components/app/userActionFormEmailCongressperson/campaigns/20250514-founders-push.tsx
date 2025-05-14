import { UserActionType } from '@prisma/client'

import {
  UserActionFormEmailCongresspersonDialog,
  type UserActionFormEmailCongresspersonDialogProps,
} from '@/components/app/userActionFormEmailCongressperson/dialog'
import {
  getFullNameSignOff,
  GetTextProps,
} from '@/components/app/userActionFormEmailCongressperson/emailBodyUtils'
import { UserActionGridCTACampaign } from '@/components/app/userActionGridCTAs/types'
import { USUserActionEmailCampaignName } from '@/utils/shared/userActionCampaigns/us/usUserActionCampaigns'

import type { CampaignMetadata } from '.'

function getEmailBodyText(props?: GetTextProps & { address?: string }) {
  const fullNameSignOff = getFullNameSignOff({
    firstName: props?.firstName,
    lastName: props?.lastName,
  })

  return `As a Stand With Crypto Advocate, I am your constituent and one of the tens of millions of Americans who own, build, or develop with cryptocurrencies and blockchain technology. Today, over 60 crypto founders and advocates are flying into D.C. to push for strong crypto legislation. On behalf of the entire crypto community, I urge you to support this important effort.

In order for the U.S. to realize the full potential of crypto, we must foster a regulatory environment that encourages the growth of the crypto industry while ensuring the protection of consumers like myself. We need clear guidelines and standards for regulation, helping to enhance the efficiency of our financial system and maintain U.S. leadership in digital asset innovation.

In the past, you’ve shown a commitment to thoughtful and forward-looking legislation, and as one of your constituents, I am grateful to you for helping move America forward. Thank you for supporting the 52 million Americans who own crypto by backing strong, sensible crypto legislation.

When you stand with crypto, you stand with millions of Americans across the country. Thank you.${fullNameSignOff}`
}

export const campaignMetadata: CampaignMetadata = {
  campaignName: USUserActionEmailCampaignName.FOUNDERS_PUSH_MAY_14_2025,
  dialogTitle: 'Email Your Member of Congress',
  dialogSubtitle: 'Support Crucial Crypto Legislation',
  politicianCategory: 'house',
  subject: 'Support Crypto Legislation',
  getEmailBodyText,
}

const WrapperComponent = (
  props: Omit<UserActionFormEmailCongresspersonDialogProps, 'campaignName'>,
) => (
  <UserActionFormEmailCongresspersonDialog
    {...props}
    campaignName={campaignMetadata.campaignName}
  />
)

export const campaignCTAConfig: UserActionGridCTACampaign = {
  actionType: UserActionType.EMAIL,
  campaignName: campaignMetadata.campaignName,
  isCampaignActive: true,
  title: campaignMetadata.dialogTitle,
  description: campaignMetadata.dialogSubtitle,
  canBeTriggeredMultipleTimes: true,
  WrapperComponent,
}
