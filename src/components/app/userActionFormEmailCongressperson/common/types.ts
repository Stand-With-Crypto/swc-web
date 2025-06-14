import { GetUserFullProfileInfoResponse } from '@/app/api/identified-user/full-profile-info/route'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { AUUserActionEmailCampaignName } from '@/utils/shared/userActionCampaigns/au/auUserActionCampaigns'
import { CAUserActionEmailCampaignName } from '@/utils/shared/userActionCampaigns/ca/caUserActionCampaigns'
import { GBUserActionEmailCampaignName } from '@/utils/shared/userActionCampaigns/gb/gbUserActionCampaigns'
import { USUserActionEmailCampaignName } from '@/utils/shared/userActionCampaigns/us/usUserActionCampaigns'

export interface UserActionFormEmailCongresspersonPropsBase {
  user: GetUserFullProfileInfoResponse['user']
  onCancel: () => void
  initialValues?: FormFields
}

export type UserActionFormEmailCongresspersonProps = UserActionFormEmailCongresspersonPropsBase &
  (
    | {
        countryCode: SupportedCountryCodes.US
        campaignName: USUserActionEmailCampaignName
      }
    | {
        countryCode: SupportedCountryCodes.CA
        campaignName: CAUserActionEmailCampaignName
      }
    | {
        countryCode: SupportedCountryCodes.GB
        campaignName: GBUserActionEmailCampaignName
      }
    | {
        countryCode: SupportedCountryCodes.AU
        campaignName: AUUserActionEmailCampaignName
      }
  )

export interface FormFields {
  address: {
    description: string
    place_id: string
  }
  email: string
  firstName: string
  lastName: string
}
