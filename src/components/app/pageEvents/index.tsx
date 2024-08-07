import { EventsIntro } from '@/components/app/pageEvents/components/events-intro'
import { EventsNearYou } from '@/components/app/pageEvents/components/events-near-you'
import { FeaturedEvents } from '@/components/app/pageEvents/components/featured-events'
import { FeaturedPastEvents } from '@/components/app/pageEvents/components/featured-past-events'
import { UpcomingEvents } from '@/components/app/pageEvents/components/upcoming-events'
import { SWCEvents } from '@/utils/shared/getSWCEvents'

interface EventsPageProps {
  events: SWCEvents
}

export function EventsPage({ events }: EventsPageProps) {
  return (
    <div className="container flex w-full flex-col items-center gap-10 px-6 pt-10 sm:gap-20 sm:pt-20 lg:gap-[6.25rem]">
      <EventsIntro />

      <FeaturedEvents events={events} />

      <EventsNearYou events={events} />

      <UpcomingEvents events={events} />

      <FeaturedPastEvents events={events} />
    </div>
  )
}
