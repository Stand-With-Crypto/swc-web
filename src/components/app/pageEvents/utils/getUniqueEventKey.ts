import { SWCEvent } from '@/utils/shared/zod/getSWCEvents'

export function getUniqueEventKey(event: SWCEvent) {
  return `${event.slug}-${event.state}-${event.city}-${event.date}${event.time ? `-${event.time}` : ''}`
}
