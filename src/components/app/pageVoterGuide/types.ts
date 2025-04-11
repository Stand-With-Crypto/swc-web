import { UserActionType } from '@prisma/client'

import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'

export type VoterGuideStep = {
  title: string
  description: string
  WrapperComponent: (args: {
    children: React.ReactNode
    countryCode?: SupportedCountryCodes
  }) => React.ReactNode
  action: UserActionType
  campaignName: string
  image: string
  mobileImage?: string
  wideDesktopImage?: boolean
}
