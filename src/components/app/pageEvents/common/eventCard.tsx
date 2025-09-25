'use client'

import { EventDialog } from '@/components/app/pageEvents/common/eventDialog'
import { StateShield } from '@/components/ui/stateShield'
import { useCountryCode } from '@/hooks/useCountryCode'
import { getLocaleForLanguage } from '@/utils/shared/i18n/interpolationUtils'
import { SWCEvent } from '@/utils/shared/zod/getSWCEvents'
import { useLanguage } from '@/utils/web/i18n/useLanguage'

interface EventCardProps {
  event: SWCEvent
}

export function EventCard({ event, ...props }: EventCardProps) {
  return <EventDialog event={event} trigger={<EventCardContent event={event} {...props} />} />
}

function EventCardContent({ event }: EventCardProps) {
  const countryCode = useCountryCode()
  const language = useLanguage()

  const formattedEventDate = new Intl.DateTimeFormat(getLocaleForLanguage(language), {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(`${event.date}T00:00`))

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
