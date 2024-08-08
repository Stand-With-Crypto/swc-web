import { EventDialog } from '@/components/app/pageEvents/components/event-dialog'
import { EventsIntro } from '@/components/app/pageEvents/components/events-intro'
import { EventsNearYou } from '@/components/app/pageEvents/components/events-near-you'
import { FeaturedEvents } from '@/components/app/pageEvents/components/featured-events'
import { FeaturedPastEvents } from '@/components/app/pageEvents/components/featured-past-events'
import { StateEventsDialog } from '@/components/app/pageEvents/components/state-events-dialog'
import { SuccessfulEventNotificationsSignupDialog } from '@/components/app/pageEvents/components/successful-event-signup-dialog'
import { UpcomingEvents } from '@/components/app/pageEvents/components/upcoming-events'

export function EventsPage() {
  return (
    <div className="container flex w-full flex-col items-center gap-10 px-6 pt-10 sm:gap-20 sm:pt-20 lg:gap-[6.25rem]">
      <EventsIntro />

      <FeaturedEvents />

      <EventsNearYou />

      <UpcomingEvents />

      <FeaturedPastEvents />

      {/* The DIALOGS BELOW ARE FOR TESTING ONLY. They will be removed in the final version. */}

      <StateEventsDialog state="DE" />

      <EventDialog
        address="1234 House St, Los Angeles, CA 90068"
        date={new Date().toISOString()}
        description="Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. "
        googleMapsLink="https://maps.app.goo.gl/674bxtK8BNQu6QDN8"
        name="Global Advisory Council Meeting"
        state="CA"
      />

      <SuccessfulEventNotificationsSignupDialog />
    </div>
  )
}
