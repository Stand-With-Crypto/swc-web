import { z } from 'zod'

import { GetUserFullProfileInfoResponse } from '@/app/api/identified-user/full-profile-info/route'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { AUUserActionEmailCampaignName } from '@/utils/shared/userActionCampaigns/au/auUserActionCampaigns'
import { CAUserActionEmailCampaignName } from '@/utils/shared/userActionCampaigns/ca/caUserActionCampaigns'
import { GBUserActionEmailCampaignName } from '@/utils/shared/userActionCampaigns/gb/gbUserActionCampaigns'
import { USUserActionEmailCampaignName } from '@/utils/shared/userActionCampaigns/us/usUserActionCampaigns'
import { GenericErrorFormValues } from '@/utils/web/formUtils'
import { zodUserActionFormEmailCongresspersonFields } from '@/validation/forms/zodUserActionFormEmailCongressperson'

export interface UserActionFormEmailCongresspersonPropsBase {
  user: GetUserFullProfileInfoResponse['user']
  onCancel: () => void
  initialValues?: FormFields
}

export interface UserActionFormEmailCongresspersonProps
  extends UserActionFormEmailCongresspersonPropsBase {
  countryCode: SupportedCountryCodes
  campaignName: EmailActionCampaignNames
}

export interface FormFields {
  address: {
    description: string
    place_id: string
  }
  email: string
  firstName: string
  lastName: string
}

export type EmailActionFormValues = z.infer<typeof zodUserActionFormEmailCongresspersonFields> &
  GenericErrorFormValues

export type EmailActionCampaignNames =
  | USUserActionEmailCampaignName
  | CAUserActionEmailCampaignName
  | GBUserActionEmailCampaignName
  | AUUserActionEmailCampaignName
