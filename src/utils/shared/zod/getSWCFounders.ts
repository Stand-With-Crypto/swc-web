import { object, string, z } from 'zod'

export const zodFoundersSchemaValidation = object({
  data: object({
    name: string(),
    at: string(),
    founderLink: string().url(),
    image: string().url(),
  }),
})

export type SWCFounders = z.infer<typeof zodFoundersSchemaValidation>[]
