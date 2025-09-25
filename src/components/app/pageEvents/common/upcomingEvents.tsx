'use client'

import { useMemo, useState } from 'react'
import { isAfter } from 'date-fns'

import { EventCard } from '@/components/app/pageEvents/common/eventCard'
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
import { withI18nCommons } from '@/utils/shared/i18n/commons'
import { createI18nMessages } from '@/utils/shared/i18n/createI18nMessages'
import { getStateNameResolver } from '@/utils/shared/stateUtils'
import { SWCEvents } from '@/utils/shared/zod/getSWCEvents'
import { useTranslation } from '@/utils/web/i18n/useTranslation'

interface UpcomingEventsProps {
  events: SWCEvents
}

const i18nMessages = withI18nCommons(
  createI18nMessages({
    defaultMessages: {
      en: {
        all: 'All',
        loadMore: 'Load more',
      },
      fr: {
        all: 'Tous',
        loadMore: 'Charger plus',
      },
      de: {
        all: 'Alle',
        loadMore: 'Mehr laden',
      },
    },
  }),
)

export function UpcomingEventsList({ events }: UpcomingEventsProps) {
  const { t } = useTranslation(i18nMessages, 'upcomingEvents')

  const [eventsToShow, setEventsToShow] = useState(5)
  const [selectedStateFilter, setSelectedStateFilter] = useState('All')
  const countryCode = useCountryCode()

  const stateNameResolver = getStateNameResolver(countryCode)

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
      name: `${stateNameResolver(state)} (${stateWithEvents[state]})`,
    }))

    options.unshift({ key: 'All', name: t('all') })

    return options
  }, [events, stateNameResolver, t])

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
            {t('territoryDivision')}
          </span>
          <span className="mr-auto">
            <SelectValue placeholder={t('all')} />
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
          {t('loadMore')}
        </Button>
      )}
    </>
  )
}
