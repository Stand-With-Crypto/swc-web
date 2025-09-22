import { SWCEvents } from '@/utils/shared/zod/getSWCEvents'

export function getPromotedEvents(events?: SWCEvents | null) {
  return events
    ?.filter(event => !!event.data.promotedPositioning)
    .sort((a, b) => a.data.promotedPositioning! - b.data.promotedPositioning!)
}
