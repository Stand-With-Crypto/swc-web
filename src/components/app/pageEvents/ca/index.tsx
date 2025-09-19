import { isAfter, isBefore, parseISO, subDays } from 'date-fns'

import { AllUpcomingEvents } from '@/components/app/pageEvents/common/allUpcomingEvents'
import { EventsIntro } from '@/components/app/pageEvents/common/eventsIntro'
import { EventsNearYou } from '@/components/app/pageEvents/common/eventsNearYou'
import { FeaturedPastEvents } from '@/components/app/pageEvents/common/featuredPastEvents'
import { PromotedEvents } from '@/components/app/pageEvents/common/promotedEvents'
import { EventsPageProps } from '@/components/app/pageEvents/common/types'
import { EventsPageWrapper } from '@/components/app/pageEvents/common/wrapper'
import { PageSubTitle } from '@/components/ui/pageSubTitle'
import { PageTitle } from '@/components/ui/pageTitleText'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'

const countryCode = SupportedCountryCodes.CA

export function CaPageEvents({ events, isDeepLink }: EventsPageProps) {
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
    <EventsPageWrapper isDeepLink={isDeepLink}>
      <EventsIntro>
        <PageTitle>Events</PageTitle>
        <PageSubTitle>
          Stand With Crypto Alliance is dedicated to engaging and empowering the crypto community
          both online and at real-world events. Crypto is a major force in our economy, our
          politics, and our culture – but we need to keep up the momentum.
        </PageSubTitle>
      </EventsIntro>
      {promotedEvents && promotedEvents.length > 0 && (
        <PromotedEvents countryCode={countryCode} events={promotedEvents} />
      )}

      <EventsNearYou events={futureEvents ?? []} />

      {futureEvents && futureEvents.length > 0 && (
        <AllUpcomingEvents countryCode={countryCode} events={futureEvents} showMap={false} />
      )}

      {featuredPastEvents && featuredPastEvents.length > 0 && (
        <FeaturedPastEvents events={featuredPastEvents} />
      )}
    </EventsPageWrapper>
  )
}
