import { format, isBefore } from 'date-fns'

import { NextImage } from '@/components/ui/image'
import { SWCEvents } from '@/utils/shared/getSWCEvents'

interface FeaturedPastEventsProps {
  events: SWCEvents
}

export function FeaturedPastEvents({ events }: FeaturedPastEventsProps) {
  const pastFeaturedEvents = events.filter(event =>
    isBefore(new Date(event.data.datetime), new Date()),
  )

  if (!pastFeaturedEvents.length) return null

  return (
    <section className="grid w-full gap-4">
      <h4 className="text-bold mb-2 text-center font-sans text-xl text-foreground lg:text-[2rem]">
        Featured past events
      </h4>

      <div className="grid gap-4 lg:grid-cols-3">
        {pastFeaturedEvents.map(event => (
          <div className="group relative" key={event.data.slug}>
            <div className="relative h-[222px] min-w-[345px] lg:h-[271px] lg:min-w-[271px]">
              <NextImage
                alt={event.data.name}
                className="object-cover object-center"
                fill
                src={event.data.image}
              />
            </div>
            <EventOverlay eventDate={event.data.datetime} eventName={event.data.name} />
          </div>
        ))}
      </div>
    </section>
  )
}

function EventOverlay({ eventName, eventDate }: { eventName: string; eventDate: string }) {
  const formattedDate = format(new Date(eventDate), 'MMMM dd, yyyy')

  return (
    <div className="absolute inset-0 flex items-center justify-center rounded-lg opacity-0 transition-opacity duration-300 ease-in-out group-hover:opacity-100">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/60 opacity-75" />

      <div className="relative z-10 flex h-full w-full cursor-pointer flex-col items-start justify-end p-4 text-left text-white">
        <h2 className="text-xl font-bold">{eventName}</h2>
        <p className="text-lg">{formattedDate}</p>
      </div>
    </div>
  )
}
