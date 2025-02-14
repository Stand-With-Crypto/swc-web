import { array, boolean, discriminatedUnion, literal, number, object, string, z } from 'zod'

export const zodPollSchemaValidation = object({
  id: string(),
  name: string(),
  data: discriminatedUnion('multiple', [
    object({
      pollTitle: string(),
      allowOther: boolean(),
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
