'use client'

import { Suspense, useMemo } from 'react'
import Balancer from 'react-wrap-balancer'

import { EventCard } from '@/components/app/pageEvents/components/eventCard'
import { GooglePlacesSelect } from '@/components/ui/googlePlacesSelect'
import { PageTitle } from '@/components/ui/pageTitleText'
import { useMutableCurrentUserAddress } from '@/hooks/useCurrentUserAddress'
import { US_MAIN_STATE_CODE_TO_DISPLAY_NAME_MAP } from '@/utils/shared/stateMappings/usStateUtils'
import { SWCEvents } from '@/utils/shared/zod/getSWCEvents'

interface EventsNearYouProps {
  events: SWCEvents
}

export function EventsNearYou(props: EventsNearYouProps) {
  return (
    <Suspense fallback={null}>
      <SuspenseEventsNearYou {...props} />
    </Suspense>
  )
}

function SuspenseEventsNearYou({ events }: EventsNearYouProps) {
  const { setAddress, address } = useMutableCurrentUserAddress()

  const userState = useMemo(() => {
    if (address === 'loading') return null

    const possibleStateMatches = address?.description.matchAll(/\s([A-Z]{2})\s*/g)

    if (!possibleStateMatches) return null

    for (const match of possibleStateMatches) {
      const stateCode = match[1]
      if (
        US_MAIN_STATE_CODE_TO_DISPLAY_NAME_MAP[
          stateCode as keyof typeof US_MAIN_STATE_CODE_TO_DISPLAY_NAME_MAP
        ]
      ) {
        return stateCode
      }
    }

    return null
  }, [address])

  return (
    <section className="grid w-full items-center gap-4 lg:gap-6">
      <PageTitle as="h3">Events near you</PageTitle>

      <div className="mx-auto w-full max-w-[562px]">
        <GooglePlacesSelect
          className="bg-backgroundAlternate"
          loading={address === 'loading'}
          onChange={setAddress}
          placeholder="Enter your address"
          shouldLimitUSAddresses
          value={address !== 'loading' ? address : null}
        />
      </div>

      {userState ? <FilteredEventsNearUser events={events} userState={userState} /> : null}
    </section>
  )
}

function FilteredEventsNearUser({ events, userState }: { events: SWCEvents; userState: string }) {
  const filteredEventsNearUser = useMemo(() => {
    return events.filter(event => event.data.state === userState)
  }, [events, userState])

  const hasEvents = filteredEventsNearUser.length > 0

  if (!userState) return null

  return (
    <div className="flex w-full flex-col items-center gap-4">
      {hasEvents ? (
        filteredEventsNearUser.map(event => <EventCard event={event.data} key={event.data.slug} />)
      ) : (
        <p className="text-center font-mono text-sm text-muted-foreground">
          <Balancer>
            Unfortunately, there are no events happening near you at the moment. Please check back
            later for updates, as new events may be added soon.
          </Balancer>
        </p>
      )}
    </div>
  )
}
