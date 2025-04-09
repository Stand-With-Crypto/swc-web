import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { zodGooglePlacesAutocompletePrediction } from '@/validation/fields/zodGooglePlacesAutocompletePrediction'
import { zodFirstName, zodLastName } from '@/validation/fields/zodName'
import { zodPhoneNumber } from '@/validation/fields/zodPhoneNumber'
import { zodOptionalEmptyString } from '@/validation/utils'

import { getZodUpdateUserProfileBaseSchema, zodUpdateUserProfileBaseSuperRefine } from './base'

export const getZodUpdateUserProfileFormFields = (countryCode: SupportedCountryCodes) =>
  getZodUpdateUserProfileBaseSchema(countryCode)
    .extend({
      firstName: zodOptionalEmptyString(zodFirstName),
      lastName: zodOptionalEmptyString(zodLastName),
      address: zodGooglePlacesAutocompletePrediction.nullable(),
    })
    .superRefine(zodUpdateUserProfileBaseSuperRefine)
// previously there was a requirement that we don't allow users to become members if
// they dont fill out their first/last name, but this causes issues because we stop showing the checkbox
// but a user can still modify their profile and remove their first/last name, causing the form to break (wont submit but no errors are displayed)

export const getZodUpdateUserProfileWithRequiredFormFieldsSchema = (
  countryCode: SupportedCountryCodes,
) =>
  getZodUpdateUserProfileBaseSchema(countryCode)
    .omit({ phoneNumber: true })
    .extend({
      firstName: zodFirstName,
      lastName: zodLastName,
      address: zodGooglePlacesAutocompletePrediction,
      phoneNumber: zodPhoneNumber(countryCode),
    })
    .superRefine(zodUpdateUserProfileBaseSuperRefine)
