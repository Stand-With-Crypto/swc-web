import { isAfter, parseISO, subDays } from 'date-fns'

import { GeoGate } from '@/components/app/geoGate'
import { AllUpcomingEvents } from '@/components/app/pageEvents/components/allUpcomingEvents'
import { EventsIntro } from '@/components/app/pageEvents/components/eventsIntro'
import { EventsNearYou } from '@/components/app/pageEvents/components/eventsNearYou'
import { FeaturedPastEvents } from '@/components/app/pageEvents/components/featuredPastEvents'
import { PromotedEvents } from '@/components/app/pageEvents/components/promotedEvents'
import { SWCEvents } from '@/utils/shared/getSWCEvents'
import { DEFAULT_SUPPORTED_COUNTRY_CODE } from '@/utils/shared/supportedCountries'
import { cn } from '@/utils/web/cn'

interface EventsPageProps {
  events: SWCEvents
  isDeepLink?: boolean
}

export function EventsPage({ events, isDeepLink }: EventsPageProps) {
  const filteredFutureEvents = events.filter(event =>
    isAfter(parseISO(event.data.date), subDays(new Date(), 1)),
  )

  return (
    <div
      className={cn(
        'standard-spacing-from-navbar container flex w-full flex-col items-center gap-10 px-6 sm:gap-20 lg:gap-[6.25rem]',
        isDeepLink && 'h-screen',
      )}
    >
      <EventsIntro />

      <PromotedEvents events={events} />

      <GeoGate countryCode={DEFAULT_SUPPORTED_COUNTRY_CODE}>
        <EventsNearYou events={filteredFutureEvents} />
      </GeoGate>

      <AllUpcomingEvents events={filteredFutureEvents} />

      <FeaturedPastEvents events={events} />
    </div>
  )
}
