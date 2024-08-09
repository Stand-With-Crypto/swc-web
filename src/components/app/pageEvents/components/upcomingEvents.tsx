'use client'

import { useMemo, useState } from 'react'
import { isAfter } from 'date-fns'

import { EventCard } from '@/components/app/pageEvents/components/eventCard'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { SWCEvents } from '@/utils/shared/getSWCEvents'
import { US_MAIN_STATE_CODE_TO_DISPLAY_NAME_MAP } from '@/utils/shared/usStateUtils'

interface UpcomingEventsProps {
  events: SWCEvents
}

export function UpcomingEvents({ events }: UpcomingEventsProps) {
  const [eventsToShow, setEventsToShow] = useState(5)
  const [selectedStateFilter, setSelectedStateFilter] = useState('All')

  const filteredFutureEvents = useMemo(() => {
    return events.filter(event => isAfter(new Date(event.data.datetime), new Date()))
  }, [events])

  const filteredEvents =
    selectedStateFilter === 'All'
      ? filteredFutureEvents
      : filteredFutureEvents.filter(event => event.data.state === selectedStateFilter)

  const stateFilterOptions = useMemo(() => {
    const stateWithEvents = filteredFutureEvents.reduce(
      (acc, event) => {
        const state = event.data.state
        acc[state] = (acc[state] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    const stateArr = Object.keys(stateWithEvents)

    const options = stateArr.map(state => ({
      key: state,
      name: `${US_MAIN_STATE_CODE_TO_DISPLAY_NAME_MAP[state as keyof typeof US_MAIN_STATE_CODE_TO_DISPLAY_NAME_MAP]} (${stateWithEvents[state]})`,
    }))

    options.unshift({ key: 'All', name: 'All' })

    return options
  }, [filteredFutureEvents])

  return (
    <section className="flex w-full flex-col items-center gap-4 lg:gap-6">
      <h4 className="text-bold font-sans text-xl text-foreground lg:text-[2rem]">
        All upcoming events
      </h4>

      <Select
        onValueChange={state => {
          setSelectedStateFilter(state)
          setEventsToShow(5)
        }}
        value={selectedStateFilter}
      >
        <SelectTrigger className="max-w-[345px]">
          <span className="mr-2 inline-block flex-shrink-0 font-bold">State</span>
          <span className="mr-auto">
            <SelectValue placeholder="All" />
          </span>
        </SelectTrigger>
        <SelectContent>
          {stateFilterOptions.map(state => (
            <SelectItem key={state.key} value={state.key}>
              {state.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <div className="my-2 flex w-full flex-col items-center gap-4">
        {filteredEvents.slice(0, eventsToShow).map(event => (
          <EventCard event={event.data} key={event.data.slug} />
        ))}
      </div>

      {eventsToShow < filteredEvents.length && (
        <Button onClick={() => setEventsToShow(eventsToShow + 5)} size="lg" variant="secondary">
          Load more
        </Button>
      )}
    </section>
  )
}
