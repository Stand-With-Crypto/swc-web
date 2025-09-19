import { isAfter, isBefore, parseISO, startOfDay, subDays } from 'date-fns'

import { AllUpcomingEvents } from '@/components/app/pageEvents/components/allUpcomingEvents'
import { EventDialog } from '@/components/app/pageEvents/components/eventDialog'
import { EventsIntro } from '@/components/app/pageEvents/components/eventsIntro'
import { EventsNearYou } from '@/components/app/pageEvents/components/eventsNearYou'
import { FeaturedPastEvents } from '@/components/app/pageEvents/components/featuredPastEvents'
import * as PromotedEvents from '@/components/app/pageEvents/components/promotedEvents'
import { Button } from '@/components/ui/button'
import { PageSubTitle } from '@/components/ui/pageSubTitle'
import { PageTitle } from '@/components/ui/pageTitleText'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { SWCEvents } from '@/utils/shared/zod/getSWCEvents'
import { cn } from '@/utils/web/cn'

export interface CAEventsPageProps {
  events: SWCEvents | null
  isDeepLink?: boolean
}

const countryCode = SupportedCountryCodes.CA

export function CAEventsPage({ events, isDeepLink }: CAEventsPageProps) {
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
      <EventsIntro>
        <PageTitle>Events</PageTitle>
        <PageSubTitle>
          Stand With Crypto Alliance is dedicated to engaging and empowering the crypto community
          both online and at real-world events. Crypto is a major force in our economy, our
          politics, and our culture – but we need to keep up the momentum.
        </PageSubTitle>
      </EventsIntro>

      {promotedEvents && promotedEvents.length > 0 && (
        <PromotedEvents.Root>
          <>
            {promotedEvents.map(event => {
              const eventDate = event.data.time
                ? new Date(`${event.data.date}T${event.data.time}`)
                : new Date(event.data.date)

              const isPastEvent = isBefore(startOfDay(eventDate), startOfDay(new Date()))

              return (
                <PromotedEvents.Event
                  action={
                    isPastEvent ? (
                      <EventDialog
                        event={event.data}
                        trigger={
                          <Button
                            asChild
                            className="mt-2 w-full sm:w-fit lg:mt-4"
                            variant="secondary"
                          >
                            <span>See what happened</span>
                          </Button>
                        }
                        triggerClassName="w-full sm:w-fit"
                      />
                    ) : (
                      <PromotedEvents.RsvpButton countryCode={countryCode} event={event.data}>
                        RSVP
                      </PromotedEvents.RsvpButton>
                    )
                  }
                  countryCode={countryCode}
                  event={event.data}
                  key={event.data.slug}
                />
              )
            })}
          </>
        </PromotedEvents.Root>
      )}

      <EventsNearYou events={futureEvents ?? []} />

      {futureEvents && futureEvents.length > 0 && (
        <AllUpcomingEvents countryCode={countryCode} events={futureEvents} showMap={false} />
      )}

      {featuredPastEvents && featuredPastEvents.length > 0 && (
        <FeaturedPastEvents events={featuredPastEvents} />
      )}
    </div>
  )
}
