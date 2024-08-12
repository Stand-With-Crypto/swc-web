import { AllUpcomingEvents } from '@/components/app/pageEvents/components/allUpcomingEvents'
import { EventsIntro } from '@/components/app/pageEvents/components/eventsIntro'
import { EventsNearYou } from '@/components/app/pageEvents/components/eventsNearYou'
import { PromotedEvents } from '@/components/app/pageEvents/components/promotedEvents'
import { SWCEvents } from '@/utils/shared/getSWCEvents'
import { cn } from '@/utils/web/cn'

interface EventsPageProps {
  events: SWCEvents
  isDeepLink?: boolean
}

export function EventsPage({ events, isDeepLink }: EventsPageProps) {
  return (
    <div
      className={cn(
        'container flex w-full flex-col items-center gap-10 px-6 pt-10 sm:gap-20 sm:pt-20 lg:gap-[6.25rem]',
        isDeepLink && 'h-screen',
      )}
    >
      <EventsIntro />

      <PromotedEvents events={events} />

      <AllUpcomingEvents events={events} />

      <EventsNearYou events={events} />

      {/* <FeaturedPastEvents events={events} /> */}
    </div>
  )
}
