'use client'

import { format } from 'date-fns'

import { EventDialog } from '@/components/app/pageEvents/components/eventDialog'
import { StateShield } from '@/components/ui/stateShield'
import { useCountryCode } from '@/hooks/useCountryCode'
import { SWCEvent } from '@/utils/shared/zod/getSWCEvents'

interface EventCardProps {
  event: SWCEvent
}

export function EventCard({ event, ...props }: EventCardProps) {
  return <EventDialog event={event} trigger={<EventCardContent event={event} {...props} />} />
}

function EventCardContent({ event }: EventCardProps) {
  const countryCode = useCountryCode()

  const formattedEventDate = format(new Date(`${event.date}T00:00`), 'MMMM d, yyyy')

  return (
    <div className="flex w-full max-w-[856px] flex-col gap-2 rounded-2xl bg-backgroundAlternate p-6 pt-4 text-left transition hover:drop-shadow-lg lg:flex-row lg:items-center">
      <StateShield
        className="mb-2 lg:mb-0"
        countryCode={countryCode}
        size={70}
        state={event.state}
      />
      <strong>{event.name}</strong>
      <p className="block text-muted-foreground lg:hidden">
        {event.city}, {event.state} • {formattedEventDate}
      </p>
      <div className="ml-auto hidden flex-col items-end lg:flex">
        <p>
          {event.city}, {event.state}
        </p>
        <p>{formattedEventDate}</p>
      </div>
    </div>
  )
}
