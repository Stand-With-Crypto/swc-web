import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { AUUserActionEmailCampaignName } from '@/utils/shared/userActionCampaigns/au/auUserActionCampaigns'
import { CAUserActionEmailCampaignName } from '@/utils/shared/userActionCampaigns/ca/caUserActionCampaigns'
import { GBUserActionEmailCampaignName } from '@/utils/shared/userActionCampaigns/gb/gbUserActionCampaigns'
import { USUserActionEmailCampaignName } from '@/utils/shared/userActionCampaigns/us/usUserActionCampaigns'

import {
  UserActionFormEmailCongresspersonDialog,
  UserActionFormEmailCongresspersonDialogProps,
} from './dialog'

type Args =
  | {
      countryCode: SupportedCountryCodes.US
      campaignName: USUserActionEmailCampaignName
    }
  | {
      countryCode: SupportedCountryCodes.AU
      campaignName: AUUserActionEmailCampaignName
    }
  | {
      countryCode: SupportedCountryCodes.CA
      campaignName: CAUserActionEmailCampaignName
    }
  | {
      countryCode: SupportedCountryCodes.GB
      campaignName: GBUserActionEmailCampaignName
    }
export const getEmailActionWrapperComponentByCampaignName = (args: Args) =>
  function EmailActionWrapperComponent(
    props: Omit<UserActionFormEmailCongresspersonDialogProps, 'campaignName' | 'countryCode'>,
  ) {
    return <UserActionFormEmailCongresspersonDialog {...props} {...args} />
  }
