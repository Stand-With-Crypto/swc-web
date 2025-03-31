import { array, boolean, nativeEnum, number, object, string, z } from 'zod'

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
    state: string().min(2).max(3),
    type: nativeEnum(EVENT_TYPE_OPTIONS),
    isFeatured: boolean(),
    slug: string(),
    city: string(),
    date: string(),
    time: string().optional(),
    formattedDescription: string(),
    carousel: array(object({ photo: string() })).optional(),
  }),
})

export type SWCEvents = z.infer<typeof zodEventSchemaValidation>[]
export type SWCEvent = SWCEvents[0]['data']
