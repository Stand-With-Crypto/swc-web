import { array, boolean, discriminatedUnion, literal, number, object, string, z } from 'zod'

export const zodPollSchemaValidation = object({
  id: string(),
  name: string(),
  // discriminated union allows us to have different poll types (single choice, multiple choice)
  // and we can have different requirements for maxNumberOptionsSelected
  data: discriminatedUnion('multiple', [
    object({
      pollTitle: string(),
      allowOther: boolean(),
      endDate: string(),
      pollList: array(
        object({
          value: string(),
          displayName: string(),
          description: string().optional(),
        }),
      ),
      multiple: literal(false),
      maxNumberOptionsSelected: number().optional(),
    }),
    object({
      pollTitle: string(),
      allowOther: boolean(),
      endDate: string(),
      pollList: array(
        object({
          value: string(),
          displayName: string(),
          description: string().optional(),
        }),
      ),
      multiple: literal(true),
      maxNumberOptionsSelected: number(),
    }),
  ]),
})

export type SWCPoll = z.infer<typeof zodPollSchemaValidation>
