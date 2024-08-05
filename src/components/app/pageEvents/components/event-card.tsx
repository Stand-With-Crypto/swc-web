import { format } from 'date-fns'

import { NextImage } from '@/components/ui/image'

const event = {
  state: 'GA',
  name: 'Global Advisory Council Meeting',
  city: 'Atlanta',
  date: new Date().toISOString(),
}

export function EventCard() {
  const formattedEventDate = format(new Date(event.date), 'MMMM d, yyyy')

  return (
    <div className="flex w-full max-w-[856px] flex-col gap-2 rounded-2xl bg-backgroundAlternate p-6 pt-4 lg:flex-row lg:items-center">
      <NextImage
        alt={`${event.state} shield`}
        className="mb-2 lg:mb-0"
        height={70}
        src={`/stateShields/${event.state}.png`}
        width={70}
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
