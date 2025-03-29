'use client'

import { useMemo, useState } from 'react'
import { isAfter } from 'date-fns'

import { EventCard } from '@/components/app/pageEvents/components/eventCard'
import { getUniqueEventKey } from '@/components/app/pageEvents/utils/getUniqueEventKey'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useCountryCode } from '@/hooks/useCountryCode'
import { getAUStateNameFromStateCode } from '@/utils/shared/auStateUtils'
import { getCAProvinceOrTerritoryNameFromCode } from '@/utils/shared/caProvinceUtils'
import { getGBCountryNameFromCode } from '@/utils/shared/gbCountryUtils'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { getUSStateNameFromStateCode } from '@/utils/shared/usStateUtils'
import { SWCEvents } from '@/utils/shared/zod/getSWCEvents'

interface UpcomingEventsProps {
  events: SWCEvents
}

const GET_STATE_NAME_FROM_CODE_MAP: Record<SupportedCountryCodes, (code: string) => string> = {
  [SupportedCountryCodes.AU]: getAUStateNameFromStateCode,
  [SupportedCountryCodes.CA]: getCAProvinceOrTerritoryNameFromCode,
  [SupportedCountryCodes.GB]: getGBCountryNameFromCode,
  [SupportedCountryCodes.US]: getUSStateNameFromStateCode,
}

const FILTER_NAME_BY_COUNTRY_MAP: Record<SupportedCountryCodes, string> = {
  [SupportedCountryCodes.AU]: 'State',
  [SupportedCountryCodes.CA]: 'Province',
  [SupportedCountryCodes.GB]: 'Country',
  [SupportedCountryCodes.US]: 'State',
}

const getStateNameFromCode = (code: string, countryCode: SupportedCountryCodes) => {
  return GET_STATE_NAME_FROM_CODE_MAP[countryCode](code)
}

export function UpcomingEventsList({ events }: UpcomingEventsProps) {
  const [eventsToShow, setEventsToShow] = useState(5)
  const [selectedStateFilter, setSelectedStateFilter] = useState('All')
  const countryCode = useCountryCode()

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
      name: `${getStateNameFromCode(state, countryCode)} (${stateWithEvents[state]})`,
    }))

    options.unshift({ key: 'All', name: 'All' })

    return options
  }, [countryCode, events])

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
          <span className="mr-2 inline-block flex-shrink-0 font-bold">
            {FILTER_NAME_BY_COUNTRY_MAP[countryCode]}
          </span>
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
          <EventCard event={event.data} key={getUniqueEventKey(event.data)} />
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
