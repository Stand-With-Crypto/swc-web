import { boolean, object, RefinementCtx, string, z } from 'zod'

import { DEFAULT_SUPPORTED_COUNTRY_CODE } from '@/utils/shared/supportedCountries'
import { zodEmailAddress } from '@/validation/fields/zodEmailAddress'
import { zodOptionalEmptyPhoneNumber } from '@/validation/fields/zodPhoneNumber'
import { zodOptionalEmptyString } from '@/validation/utils'

export const getZodUpdateUserProfileBaseSchema = (countryCode = DEFAULT_SUPPORTED_COUNTRY_CODE) =>
  object({
    isEmbeddedWalletUser: boolean(),
    emailAddress: zodEmailAddress,
    phoneNumber: zodOptionalEmptyPhoneNumber(countryCode),
    optedInToSms: boolean(),
    hasOptedInToMembership: boolean(),
    // This now comes after the form in a separate step
    // informationVisibility: nativeEnum(UserInformationVisibility),
  })

export function zodUpdateUserProfileBaseSuperRefine(
  data: z.infer<ReturnType<typeof getZodUpdateUserProfileBaseSchema>>,
  ctx: RefinementCtx,
) {
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
  if (!data.phoneNumber && data.optedInToSms) {
    ctx.addIssue({
      code: 'custom',
      message: 'Please enter a phone number to opt in to SMS',
      path: ['phoneNumber'],
    })
  }
}
