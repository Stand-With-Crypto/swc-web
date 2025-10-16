import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { AUUserActionLetterCampaignName } from '@/utils/shared/userActionCampaigns/au/auUserActionCampaigns'

import {
  UserActionFormLetterDialog,
  UserActionFormLetterDialogProps,
} from './dialog'

type Args = {
  countryCode: SupportedCountryCodes.AU
  campaignName: AUUserActionLetterCampaignName
}

export const getLetterActionWrapperComponentByCampaignName = (args: Args) =>
  function LetterActionWrapperComponent(
    props: Omit<UserActionFormLetterDialogProps, 'campaignName' | 'countryCode'>,
  ) {
    return <UserActionFormLetterDialog {...props} {...args} />
  }

