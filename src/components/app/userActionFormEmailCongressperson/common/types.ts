import { GetUserFullProfileInfoResponse } from '@/app/api/identified-user/full-profile-info/route'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { YourPoliticianCategory } from '@/utils/shared/yourPoliticianCategory'

export interface UserActionFormEmailCongresspersonProps {
  countryCode: SupportedCountryCodes
  user: GetUserFullProfileInfoResponse['user']
  onCancel: () => void
  initialValues?: FormFields
  politicianCategory?: YourPoliticianCategory
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
