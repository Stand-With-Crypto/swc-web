import { isAfter, parseISO, subDays } from 'date-fns'

import { SWCEvents } from '@/utils/shared/zod/getSWCEvents'

export function getFutureEvents(events?: SWCEvents | null) {
  return events?.filter(event => isAfter(parseISO(event.data.date), subDays(new Date(), 1)))
}
