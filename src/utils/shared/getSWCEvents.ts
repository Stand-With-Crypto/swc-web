import { array, boolean, nativeEnum, number, object, string } from 'zod'

export enum EVENT_TYPE_OPTIONS {
  'official' = 'official',
  'partner' = 'partner',
}

export const zodEventsSchemaValidation = array(
  object({
    data: object({
      promotedPositioning: number().optional(),
      image: string().url(),
      rsvpUrl: string().url(),
      datetime: string(),
      formattedAddress: string(),
      countryCode: string().length(2),
      isOccuring: boolean(),
      name: string(),
      state: string().length(2),
      type: nativeEnum(EVENT_TYPE_OPTIONS),
      isFeatured: boolean(),
      slug: string(),
      city: string(),
      description: string(),
    }),
    published: string().regex(/^published$/),
  }),
)

export type SWCEvents = Zod.infer<typeof zodEventsSchemaValidation>
