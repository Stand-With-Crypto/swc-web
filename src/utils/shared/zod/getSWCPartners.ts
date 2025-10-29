import { object, string, url, z } from 'zod'

export const zodPartnerSchemaValidation = object({
  data: object({
    image: url(),
    imageAlt: string(),
    imageLink: url(),
  }),
})

export type SWCPartners = z.infer<typeof zodPartnerSchemaValidation>[]
