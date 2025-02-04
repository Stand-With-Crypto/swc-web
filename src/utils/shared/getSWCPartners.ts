import { array, object, string } from 'zod'

export const zodPartnerSchemaValidation = object({
  data: object({
    image: string().url(),
    imageAlt: string(),
    imageLink: string().url(),
  }),
})

const zodEventsSchemaValidation = array(zodPartnerSchemaValidation)

export type SWCPartners = Zod.infer<typeof zodEventsSchemaValidation>
