import { z } from 'zod'

import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { zodPhoneNumber } from '@/validation/fields/zodPhoneNumber'

export const getZodQuestionnaireSubmitSchema = (countryCode: SupportedCountryCodes) =>
  z.object({
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    email: z.string().email(),
    phoneNumber: zodPhoneNumber(countryCode),
    company: z.string().min(1),
    dtsiSlug: z.string().min(1).optional(),
    countryCode: z.nativeEnum(SupportedCountryCodes),
    stateAndDistrict: z.string().min(1),
    formType: z.string().min(1),
    answers: z.record(z.union([z.boolean(), z.string()])),
  })

export type QuestionnaireSubmitInput = z.infer<ReturnType<typeof getZodQuestionnaireSubmitSchema>>
