import { AllUpcomingEvents } from '@/components/app/pageEvents/common/allUpcomingEvents'
import { EventsIntro } from '@/components/app/pageEvents/common/eventsIntro'
import { EventsNearYou } from '@/components/app/pageEvents/common/eventsNearYou'
import { FeaturedPastEvents } from '@/components/app/pageEvents/common/featuredPastEvents'
import { PromotedEvents } from '@/components/app/pageEvents/common/promotedEvents'
import { EventsPageProps } from '@/components/app/pageEvents/common/types'
import { EventsPageWrapper } from '@/components/app/pageEvents/common/wrapper'
import { getFeaturedPastEvents } from '@/components/app/pageEvents/utils/getFeaturedPastEvents'
import { getFutureEvents } from '@/components/app/pageEvents/utils/getFutureEvents'
import { getPromotedEvents } from '@/components/app/pageEvents/utils/getPromotedEvents'
import { PageSubTitle } from '@/components/ui/pageSubTitle'
import { PageTitle } from '@/components/ui/pageTitleText'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'

const countryCode = SupportedCountryCodes.CA

export function CaPageEvents({ events, isDeepLink }: EventsPageProps) {
  const futureEvents = getFutureEvents(events)
  const promotedEvents = getPromotedEvents(futureEvents)
  const featuredPastEvents = getFeaturedPastEvents(events)

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
