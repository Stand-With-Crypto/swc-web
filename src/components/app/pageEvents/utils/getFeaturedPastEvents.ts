import { isBefore } from 'date-fns'

import { SWCEvents } from '@/utils/shared/zod/getSWCEvents'

export function getFeaturedPastEvents(events?: SWCEvents | null) {
  return events?.filter(event => {
    const eventDate = event.data?.time
      ? new Date(`${event.data.date}T${event.data.time}`)
      : new Date(event.data.date)

    return isBefore(eventDate, new Date())
  })
}
