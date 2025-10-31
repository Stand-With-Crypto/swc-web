import { object, string, url, z } from 'zod'

export const zodFoundersSchemaValidation = object({
  data: object({
    name: string(),
    companyName: string(),
    companyUrl: url(),
    image: url(),
  }),
})

export type SWCFounder = z.infer<typeof zodFoundersSchemaValidation>
