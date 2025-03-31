import { UserActionType } from '@prisma/client'

import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { UserActionCampaignName } from '@/utils/shared/userActionCampaigns'

export type VoterGuideStep = {
  title: string
  description: string
  WrapperComponent: (args: {
    children: React.ReactNode
    countryCode?: SupportedCountryCodes
  }) => React.ReactNode
  action: UserActionType
  campaignName: UserActionCampaignName
  image: string
  mobileImage?: string
  wideDesktopImage?: boolean
}
