import { isAfter, isBefore, parseISO, subDays } from 'date-fns'

import { EventsPageSection } from '@/components/app/pageEvents/common/eventsPageSectionLayout'
import { EventsPageProps } from '@/components/app/pageEvents/common/types'
import { AllUpcomingEvents } from '@/components/app/pageEvents/components/allUpcomingEvents'
import { EventsIntro } from '@/components/app/pageEvents/components/eventsIntro'
import { EventsNearYou } from '@/components/app/pageEvents/components/eventsNearYou'
import { FeaturedPastEvents } from '@/components/app/pageEvents/components/featuredPastEvents'
import { PromotedEvents } from '@/components/app/pageEvents/components/promotedEvents'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { cn } from '@/utils/web/cn'

const countryCode = SupportedCountryCodes.US

export function UsPageEvents({ events, isDeepLink }: EventsPageProps) {
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
      <EventsIntro />

      {promotedEvents && promotedEvents.length > 0 && (
        <EventsPageSection>
          <PromotedEvents countryCode={countryCode} events={promotedEvents} />
        </EventsPageSection>
      )}

      <EventsPageSection>
        <EventsNearYou events={futureEvents ?? []} />
      </EventsPageSection>

      {futureEvents && futureEvents.length > 0 && (
        <EventsPageSection>
          <AllUpcomingEvents countryCode={countryCode} events={futureEvents} showMap />
        </EventsPageSection>
      )}

      {featuredPastEvents && featuredPastEvents.length > 0 && (
        <EventsPageSection>
          <FeaturedPastEvents events={featuredPastEvents} />
        </EventsPageSection>
      )}
    </div>
  )
}
