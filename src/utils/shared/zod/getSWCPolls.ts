import { array, boolean, number, object, string, z } from 'zod'

import { zodSupportedCountryCode } from '@/validation/fields/zodSupportedCountryCode'

export const zodPollSchemaValidation = object({
  id: string(),
  name: string(),
  data: object({
    pollTitle: string(),
    allowOther: boolean().optional(),
    endDate: string(),
    pollList: array(
      object({
        value: string(),
        displayName: string(),
        description: string().optional(),
      }),
    ),
    maxNumberOptionsSelected: number().optional().nullable(),
    countryCode: zodSupportedCountryCode.optional().nullable(),
  }),
})

export type SWCPoll = z.infer<typeof zodPollSchemaValidation>
