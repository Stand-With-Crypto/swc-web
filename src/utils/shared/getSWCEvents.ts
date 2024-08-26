import { array, boolean, nativeEnum, number, object, string } from 'zod'

enum EVENT_TYPE_OPTIONS {
  'official' = 'official',
  'partner' = 'partner',
}

export const zodEventSchemaValidation = object({
  data: object({
    promotedPositioning: number().optional(),
    image: string().url(),
    rsvpUrl: string().url(),
    formattedAddress: string(),
    countryCode: string().length(2),
    isOccuring: boolean(),
    name: string(),
    state: string().length(2),
    type: nativeEnum(EVENT_TYPE_OPTIONS),
    isFeatured: boolean(),
    slug: string(),
    city: string(),
    date: string(),
    time: string().optional(),
    formattedDescription: string(),
  }),
})

const zodEventsSchemaValidation = array(zodEventSchemaValidation)

export type SWCEvents = Zod.infer<typeof zodEventsSchemaValidation>
export type SWCEvent = SWCEvents[0]['data']
