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
import { US_MAIN_STATE_CODE_TO_DISPLAY_NAME_MAP } from '@/utils/shared/usStateUtils'
import { SWCEvents } from '@/utils/shared/zod/getSWCEvents'

interface UpcomingEventsProps {
  events: SWCEvents
}

export function UpcomingEventsList({ events }: UpcomingEventsProps) {
  const [eventsToShow, setEventsToShow] = useState(5)
  const [selectedStateFilter, setSelectedStateFilter] = useState('All')

  const filteredEvents = useMemo(() => {
    const result =
      selectedStateFilter === 'All'
        ? [...events]
        : events.filter(event => event.data.state === selectedStateFilter)

    const orderedResult = result.sort((a, b) => {
      const aDate = a.data.time ? new Date(`${a.data.date}T${a.data.time}`) : new Date(a.data.date)
      const bDate = b.data.time ? new Date(`${b.data.date}T${b.data.time}`) : new Date(b.data.date)

      return isAfter(aDate, bDate) ? 1 : -1
    })

    return orderedResult
  }, [events, selectedStateFilter])

  const stateFilterOptions = useMemo(() => {
    const stateWithEvents = events.reduce(
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
  }, [events])

  return (
    <>
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
          <EventCard event={event.data} key={event.data.slug + event.data.name} />
        ))}
      </div>

      {eventsToShow < filteredEvents.length && (
        <Button onClick={() => setEventsToShow(eventsToShow + 5)} size="lg" variant="secondary">
          Load more
        </Button>
      )}
    </>
  )
}
