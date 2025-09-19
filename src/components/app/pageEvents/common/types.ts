import { SWCEvents } from '@/utils/shared/zod/getSWCEvents'

export interface EventsPageProps {
  events: SWCEvents | null
  isDeepLink?: boolean
}
