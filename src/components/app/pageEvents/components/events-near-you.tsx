'use client'

import { LoginDialogWrapper } from '@/components/app/authentication/loginDialogWrapper'
import { EventCard } from '@/components/app/pageEvents/components/event-card'
import { EventCardSkeleton } from '@/components/app/pageEvents/components/event-card-skeleton'
import { Button } from '@/components/ui/button'
import { useApiResponseForUserFullProfileInfo } from '@/hooks/useApiResponseForUserFullProfileInfo'
import { SWCEvents } from '@/utils/shared/getSWCEvents'

interface EventsNearYouProps {
  events: SWCEvents
}

export function EventsNearYou({ events }: EventsNearYouProps) {
  const { data: userData } = useApiResponseForUserFullProfileInfo()
  const user = userData?.user
  const formattedAddress = user?.address?.formattedDescription
  const userState = user?.address?.administrativeAreaLevel1

  const filteredEventsNearUser = events.filter(event => event.data.state === userState)

  return (
    <section className="grid w-full items-center gap-4 lg:gap-6">
      <h4 className="text-bold text-center font-sans text-xl text-foreground lg:text-[2rem]">
        Events near you
      </h4>

      {formattedAddress && (
        <p className="text-center">
          Showing events for <strong className="text-primary-cta">{formattedAddress}</strong>
        </p>
      )}

      <LoginDialogWrapper
        authenticatedContent={
          <div className="flex w-full flex-col items-center gap-4">
            {filteredEventsNearUser.map(event => (
              <EventCard event={event.data} key={event.data.slug} />
            ))}
          </div>
        }
        loadingFallback={
          <div className="flex w-full flex-col items-center gap-4">
            <EventCardSkeleton />
            <EventCardSkeleton />
          </div>
        }
      >
        <div className="flex w-full max-w-[856px] flex-col gap-6 self-center rounded-2xl bg-backgroundAlternate px-[1.625rem] py-8 lg:mx-auto lg:flex-row lg:items-center lg:justify-between">
          <p className="text-center">Sign up or log in to see events near you</p>
          <Button className="w-full lg:w-auto">Sign up/in</Button>
        </div>
      </LoginDialogWrapper>
    </section>
  )
}
