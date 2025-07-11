'use client'

import { useEffect, useState } from 'react'

import { EventsMap } from '@/components/app/pageEvents/components/eventsMap'
import { UpcomingEventsList } from '@/components/app/pageEvents/components/upcomingEvents'
import { PageTitle } from '@/components/ui/pageTitleText'
import { useIsMobile } from '@/hooks/useIsMobile'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { SWCEvents } from '@/utils/shared/zod/getSWCEvents'

interface AllUpcomingEventsProps {
  events: SWCEvents
  showMap?: boolean
  countryCode: SupportedCountryCodes
}

export function AllUpcomingEvents({ events, showMap = true, countryCode }: AllUpcomingEventsProps) {
  const isMobile = useIsMobile()

  const [displayOption, setDisplayOption] = useState<'map' | 'list'>(
    isMobile || !showMap ? 'list' : 'map',
  )

  useEffect(() => {
    if (isMobile) {
      setDisplayOption('list')
    }
  }, [isMobile])

  return (
    <section className="flex w-full flex-col items-center gap-4 lg:gap-6">
      <PageTitle as="h3">All upcoming events</PageTitle>
      {!isMobile && showMap && (
        <div className="flex items-center justify-center gap-4 rounded-lg bg-backgroundAlternate px-4 py-3">
          <button onClick={() => setDisplayOption('map')}>
            <MapOptionSVG isActive={displayOption === 'map'} />
          </button>
          <div className="h-8 w-[1px] bg-border" />
          <button onClick={() => setDisplayOption('list')}>
            <ListOptionSVG isActive={displayOption === 'list'} />
          </button>
        </div>
      )}

      {displayOption === 'map' ? (
        <EventsMap countryCode={countryCode} events={events} />
      ) : (
        <UpcomingEventsList events={events} />
      )}
    </section>
  )
}

function MapOptionSVG({ isActive }: { isActive: boolean }) {
  const color = isActive ? '#6100FF' : '#5B616E'

  return (
    <svg fill="none" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M14.106 5.55326C14.3836 5.69198 14.6897 5.76419 15 5.76419C15.3103 5.76419 15.6164 5.69198 15.894 5.55326L19.553 3.72326C19.7056 3.64702 19.8751 3.61107 20.0455 3.61883C20.2159 3.62659 20.3814 3.6778 20.5265 3.76759C20.6715 3.85738 20.7911 3.98277 20.874 4.13184C20.9569 4.28091 21.0003 4.4487 21 4.61926V17.3833C20.9999 17.5689 20.9481 17.7509 20.8505 17.9088C20.7528 18.0667 20.6131 18.1943 20.447 18.2773L15.894 20.5543C15.6164 20.693 15.3103 20.7652 15 20.7652C14.6897 20.7652 14.3836 20.693 14.106 20.5543L9.894 18.4483C9.6164 18.3095 9.31033 18.2373 9 18.2373C8.68967 18.2373 8.3836 18.3095 8.106 18.4483L4.447 20.2783C4.29436 20.3545 4.12473 20.3905 3.95426 20.3827C3.78379 20.3749 3.61816 20.3236 3.47312 20.2337C3.32808 20.1438 3.20846 20.0182 3.12565 19.869C3.04284 19.7198 2.99958 19.5519 3 19.3813V6.61826C3.0001 6.4326 3.05189 6.25063 3.14956 6.09273C3.24722 5.93484 3.38692 5.80725 3.553 5.72426L8.106 3.44726C8.3836 3.30854 8.68967 3.23633 9 3.23633C9.31033 3.23633 9.6164 3.30854 9.894 3.44726L14.106 5.55326Z"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
      <path
        d="M15 5.76367V20.7637"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
      <path
        d="M9 3.23633V18.2363"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
    </svg>
  )
}

function ListOptionSVG({ isActive }: { isActive: boolean }) {
  const color = isActive ? '#6100FF' : '#5B616E'

  return (
    <svg fill="none" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M19 3H5C3.89543 3 3 3.89543 3 5V19C3 20.1046 3.89543 21 5 21H19C20.1046 21 21 20.1046 21 19V5C21 3.89543 20.1046 3 19 3Z"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
      <path
        d="M3 12H21"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
    </svg>
  )
}
