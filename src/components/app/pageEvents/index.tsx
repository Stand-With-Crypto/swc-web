import { EventsIntro } from '@/components/app/pageEvents/components/eventsIntro'
import { EventsNearYou } from '@/components/app/pageEvents/components/eventsNearYou'
import { FeaturedPastEvents } from '@/components/app/pageEvents/components/featuredPastEvents'
import { PromotedEvents } from '@/components/app/pageEvents/components/promotedEvents'
import { UpcomingEvents } from '@/components/app/pageEvents/components/upcomingEvents'
import { SWCEvents } from '@/utils/shared/getSWCEvents'

interface EventsPageProps {
  events: SWCEvents
}

export function EventsPage({ events }: EventsPageProps) {
  return (
    <div className="container flex w-full flex-col items-center gap-10 px-6 pt-10 sm:gap-20 sm:pt-20 lg:gap-[6.25rem]">
      <EventsIntro />

      <PromotedEvents events={events} />

      <UpcomingEvents events={events} />

      <EventsNearYou events={events} />

      <FeaturedPastEvents events={events} />
    </div>
  )
}
