import { GetUserFullProfileInfoResponse } from '@/app/api/identified-user/full-profile-info/route'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'

export interface UserActionFormEmailCongresspersonPropsBase {
  user: GetUserFullProfileInfoResponse['user']
  onCancel: () => void
  initialValues?: FormFields
}

export interface UserActionFormEmailCongresspersonProps
  extends UserActionFormEmailCongresspersonPropsBase {
  countryCode: SupportedCountryCodes
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
