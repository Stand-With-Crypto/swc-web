import { z } from 'zod'

import { GetUserFullProfileInfoResponse } from '@/app/api/identified-user/full-profile-info/route'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { AUUserActionLetterCampaignName } from '@/utils/shared/userActionCampaigns/au/auUserActionCampaigns'
import { GenericErrorFormValues } from '@/utils/web/formUtils'
import { zodUserActionFormLetterFields } from '@/validation/forms/zodUserActionFormLetter'

export interface UserActionFormLetterPropsBase {
  user: GetUserFullProfileInfoResponse['user']
  onCancel: () => void
  initialValues?: Partial<FormFields>
}

export interface UserActionFormLetterProps extends UserActionFormLetterPropsBase {
  countryCode: SupportedCountryCodes
  campaignName: LetterActionCampaignNames
}

export interface FormFields {
  address: {
    description: string
    place_id: string
    latitude?: number | null
    longitude?: number | null
  }
  firstName: string
  lastName: string
}

export type LetterActionFormValues = z.infer<typeof zodUserActionFormLetterFields> &
  GenericErrorFormValues

export type LetterActionCampaignNames = AUUserActionLetterCampaignName
