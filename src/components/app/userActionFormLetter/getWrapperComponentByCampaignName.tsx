import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { AUUserActionLetterCampaignName } from '@/utils/shared/userActionCampaigns/au/auUserActionCampaigns'

import { UserActionFormLetterDialog, UserActionFormLetterDialogProps } from './dialog'

type Args =
  | {
      countryCode: SupportedCountryCodes.US
      campaignName: never
    }
  | {
      countryCode: SupportedCountryCodes.AU
      campaignName: AUUserActionLetterCampaignName
    }
  | {
      countryCode: SupportedCountryCodes.CA
      campaignName: never
    }
  | {
      countryCode: SupportedCountryCodes.GB
      campaignName: never
    }

export const getLetterActionWrapperComponentByCampaignName = (args: Args) =>
  function LetterActionWrapperComponent(
    props: Omit<UserActionFormLetterDialogProps, 'campaignName' | 'countryCode'>,
  ) {
    return <UserActionFormLetterDialog {...props} {...args} />
  }
