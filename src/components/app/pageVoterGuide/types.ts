import { UserActionType } from '@prisma/client'

import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { USUserActionCampaignName } from '@/utils/shared/userActionCampaigns/us/usUserActionCampaigns'

export type VoterGuideStep = {
  title: string
  description: string
  WrapperComponent: (args: {
    children: React.ReactNode
    countryCode?: SupportedCountryCodes
  }) => React.ReactNode
  action: UserActionType
  campaignName: USUserActionCampaignName
  image: string
  mobileImage?: string
  wideDesktopImage?: boolean
}
