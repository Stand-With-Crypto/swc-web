import { normalizePhoneNumber } from '@/utils/shared/phoneNumber'
import { zodAddress } from '@/validation/fields/zodAddress'
import { zodGooglePlacesAutocompletePrediction } from '@/validation/fields/zodGooglePlacesAutocompletePrediction'
import { zodFirstName, zodLastName } from '@/validation/fields/zodName'
import { zodPhoneNumber } from '@/validation/fields/zodPhoneNumber'
import { zodOptionalEmptyString } from '@/validation/utils'
import { UserInformationVisibility } from '@prisma/client'
import { nativeEnum, object, string } from 'zod'

const base = object({
  firstName: zodOptionalEmptyString(zodFirstName),
  lastName: zodOptionalEmptyString(zodLastName),
  emailAddress: zodOptionalEmptyString(
    string().trim().email('Please enter a valid email address').toLowerCase(),
  ),
  phoneNumber: zodOptionalEmptyString(zodPhoneNumber).transform(
    str => str && normalizePhoneNumber(str),
  ),
  informationVisibility: nativeEnum(UserInformationVisibility),
})

export const zodUpdateUserProfileFormFields = base.extend({
  address: zodGooglePlacesAutocompletePrediction.nullable(),
})

export const zodUpdateUserProfileFormAction = base.extend({
  address: zodAddress.nullable(),
})
