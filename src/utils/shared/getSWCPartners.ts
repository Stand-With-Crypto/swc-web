import { object, string, z } from 'zod'

export const zodPartnerSchemaValidation = object({
  data: object({
    image: string().url(),
    imageAlt: string(),
    imageLink: string().url(),
  }),
})

export type SWCPartners = z.infer<typeof zodPartnerSchemaValidation>[]
