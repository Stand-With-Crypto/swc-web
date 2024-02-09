import { normalizePhoneNumber } from '@/utils/shared/phoneNumber'
import { zodPhoneNumber } from '@/validation/fields/zodPhoneNumber'
import { zodOptionalEmptyString } from '@/validation/utils'
import { RefinementCtx, boolean, object, string, z } from 'zod'

export const zodUpdateUserProfileBase = object({
  emailAddress: string(),
  hasOptedInToMembership: boolean(),
  hasOptedInToSms: boolean(),
  isEmbeddedWalletUser: boolean(),
  phoneNumber: zodOptionalEmptyString(zodPhoneNumber).transform(
    str => str && normalizePhoneNumber(str),
  ),
  // This now comes after the form in a separate step
  // informationVisibility: nativeEnum(UserInformationVisibility),
})

export function zodUpdateUserProfileBaseSuperRefine(
  data: z.infer<typeof zodUpdateUserProfileBase>,
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
  if (!data.phoneNumber && data.hasOptedInToSms) {
    ctx.addIssue({
      code: 'custom',
      message: 'Please enter a phone number to opt in to SMS',
      path: ['phoneNumber'],
    })
  }
}
