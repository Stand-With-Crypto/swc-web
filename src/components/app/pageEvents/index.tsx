import { isAfter, isBefore, parseISO, subDays } from 'date-fns'

import { AllUpcomingEvents } from '@/components/app/pageEvents/components/allUpcomingEvents'
import { EventsIntro } from '@/components/app/pageEvents/components/eventsIntro'
import { EventsNearYou } from '@/components/app/pageEvents/components/eventsNearYou'
import { FeaturedPastEvents } from '@/components/app/pageEvents/components/featuredPastEvents'
import { PromotedEvents } from '@/components/app/pageEvents/components/promotedEvents'
import { LanguageSwitcher } from '@/components/ui/languageSwitcher'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { SWCEvents } from '@/utils/shared/zod/getSWCEvents'
import { cn } from '@/utils/web/cn'

export interface EventsPageProps {
  events: SWCEvents | null
  isDeepLink?: boolean
  /** Default to true */
  showMap?: boolean
  countryCode: SupportedCountryCodes
}

export function EventsPage({ events, isDeepLink, showMap = true, countryCode }: EventsPageProps) {
  const futureEvents = events?.filter(event =>
    isAfter(parseISO(event.data.date), subDays(new Date(), 1)),
  )

  const promotedEvents = futureEvents
    ?.filter(event => !!event.data.promotedPositioning)
    .sort((a, b) => a.data.promotedPositioning! - b.data.promotedPositioning!)

  const featuredPastEvents = events?.filter(event => {
    const eventDate = event.data?.time
      ? new Date(`${event.data.date}T${event.data.time}`)
      : new Date(event.data.date)

    return isBefore(eventDate, new Date())
  })

  return (
    <div
      className={cn(
        'standard-spacing-from-navbar container flex w-full flex-col items-center gap-10 px-6 sm:gap-20 lg:gap-[6.25rem]',
        isDeepLink && 'h-screen',
      )}
    >
      {/* Language Switcher */}
      <div className="self-end">
        <LanguageSwitcher />
      </div>

      <EventsIntro />

      {promotedEvents && promotedEvents.length > 0 && (
        <PromotedEvents countryCode={countryCode} events={promotedEvents} />
      )}

      <EventsNearYou events={futureEvents ?? []} />

      {futureEvents && futureEvents.length > 0 && (
        <AllUpcomingEvents events={futureEvents} showMap={showMap} />
      )}

      {featuredPastEvents && featuredPastEvents.length > 0 && (
        <FeaturedPastEvents events={featuredPastEvents} />
      )}
    </div>
  )
}
