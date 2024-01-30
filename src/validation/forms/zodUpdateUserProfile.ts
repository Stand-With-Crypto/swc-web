import { normalizePhoneNumber } from '@/utils/shared/phoneNumber'
import { zodAddress } from '@/validation/fields/zodAddress'
import { zodGooglePlacesAutocompletePrediction } from '@/validation/fields/zodGooglePlacesAutocompletePrediction'
import { zodFirstName, zodLastName } from '@/validation/fields/zodName'
import { zodPhoneNumber } from '@/validation/fields/zodPhoneNumber'
import { zodOptionalEmptyString } from '@/validation/utils'
import { boolean, object, string, z, RefinementCtx } from 'zod'

const base = object({
  isEmbeddedWalletUser: boolean(),
  firstName: zodOptionalEmptyString(zodFirstName),
  lastName: zodOptionalEmptyString(zodLastName),
  emailAddress: string(),
  phoneNumber: zodOptionalEmptyString(zodPhoneNumber).transform(
    str => str && normalizePhoneNumber(str),
  ),
  hasOptedInToSms: boolean(),
  hasOptedInToMembership: boolean(),
  // This now comes after the form in a separate step
  // informationVisibility: nativeEnum(UserInformationVisibility),
})

function superRefine(data: z.infer<typeof base>, ctx: RefinementCtx) {
  if (!data.isEmbeddedWalletUser) {
    const parseEmail = zodOptionalEmptyString(
      string().trim().email('Please enter a valid email address').toLowerCase(),
    ).safeParse(data.emailAddress)
    if (!parseEmail.success) {
      parseEmail.error.issues.forEach(issue => {
        ctx.addIssue({ ...issue, path: ['emailAddress'] })
      })
    }
  }
  if (!data.phoneNumber && data.hasOptedInToSms) {
    ctx.addIssue({
      code: 'custom',
      message: 'Please enter a phone number to opt in to SMS',
      path: ['phoneNumber'],
    })
  }
}

export const zodUpdateUserProfileFormFields = base
  .extend({
    address: zodGooglePlacesAutocompletePrediction.nullable(),
  })
  .superRefine(superRefine)

export const zodUpdateUserProfileFormAction = base
  .extend({
    address: zodAddress.nullable(),
  })
  .superRefine(superRefine)
