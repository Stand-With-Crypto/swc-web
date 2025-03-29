import { object, string, z } from 'zod'

export const zodFoundersSchemaValidation = object({
  data: object({
    name: string(),
    companyName: string(),
    companyUrl: string().url(),
    image: string().url(),
  }),
})

export type SWCFounders = z.infer<typeof zodFoundersSchemaValidation>[]
