'use client'

import { Suspense, useMemo } from 'react'
import Balancer from 'react-wrap-balancer'
import { isAfter } from 'date-fns'

import { EventCard } from '@/components/app/pageEvents/components/eventCard'
import { GooglePlacesSelect } from '@/components/ui/googlePlacesSelect'
import { PageSubTitle } from '@/components/ui/pageSubTitle'
import { useMutableCurrentUserAddress } from '@/hooks/useCurrentUserAddress'
import { SWCEvents } from '@/utils/shared/getSWCEvents'
import { US_MAIN_STATE_CODE_TO_DISPLAY_NAME_MAP } from '@/utils/shared/usStateUtils'

interface EventsNearYouProps {
  events: SWCEvents
}

export function EventsNearYou(props: EventsNearYouProps) {
  return (
    <Suspense fallback={null}>
      <_EventsNearYou {...props} />
    </Suspense>
  )
}

function _EventsNearYou({ events }: EventsNearYouProps) {
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
      <PageSubTitle className="text-bold text-center font-sans text-xl text-foreground">
        Events near you
      </PageSubTitle>

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
    return userState
      ? events.filter(event => {
          const eventDate = event.data?.time
            ? new Date(`${event.data.date}T${event.data.time}`)
            : new Date(event.data.date)

          return event.data.state === userState && isAfter(eventDate, new Date())
        })
      : []
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
