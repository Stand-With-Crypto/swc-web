import { array, object, string } from 'zod'

export const zodPartnerSchemaValidation = object({
  data: object({
    name: string(),
    image: string().url(),
    imageAlt: string(),
    imageLink: object({
      '@type': string(),
      Default: string().url(),
    }),
  }),
})

const zodEventsSchemaValidation = array(zodPartnerSchemaValidation)

export type SWCPartners = Zod.infer<typeof zodEventsSchemaValidation>
