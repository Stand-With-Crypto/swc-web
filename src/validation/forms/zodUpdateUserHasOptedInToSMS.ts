import { zodUpdateUserProfileBase } from '@/validation/forms/zodUpdateUserProfile/base'

export const zodUpdateUserHasOptedInToSMS = zodUpdateUserProfileBase
  .pick({
    phoneNumber: true,
  })
  .superRefine((data, ctx) => {
    if (!data.phoneNumber) {
      ctx.addIssue({
        code: 'custom',
        message: 'Please enter a phone number to opt in to SMS',
        path: ['phoneNumber'],
      })
    }
  })
