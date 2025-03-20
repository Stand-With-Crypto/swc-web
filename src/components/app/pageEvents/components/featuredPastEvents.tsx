import { isBefore } from 'date-fns'
import { ArrowRight } from 'lucide-react'

import { EventDialog } from '@/components/app/pageEvents/components/eventDialog'
import { NextImage } from '@/components/ui/image'
import { PageTitle } from '@/components/ui/pageTitleText'
import { SWCEvents } from '@/utils/shared/zod/getSWCEvents'

interface FeaturedPastEventsProps {
  events: SWCEvents
}

export function FeaturedPastEvents({ events }: FeaturedPastEventsProps) {
  const pastFeaturedEvents = events.filter(event => {
    const eventDate = event.data?.time
      ? new Date(`${event.data.date}T${event.data.time}`)
      : new Date(event.data.date)

    return isBefore(eventDate, new Date())
  })

  if (!pastFeaturedEvents.length) return null

  return (
    <section className="grid w-full gap-4">
      <PageTitle as="h3" className="mb-2">
        Featured past events
      </PageTitle>

      <div className="grid gap-4 lg:grid-cols-3">
        {pastFeaturedEvents.map(event => (
          <EventDialog
            event={event.data}
            key={event.data.slug}
            trigger={
              <div className="group relative" key={event.data.slug}>
                <div className="relative h-[222px] min-w-[345px] lg:h-[271px] lg:min-w-[271px]">
                  <NextImage
                    alt={event.data.name}
                    className="object-cover object-center"
                    fill
                    src={event.data.image}
                  />
                </div>
                <EventOverlay eventName={event.data.name} />
              </div>
            }
            triggerClassName="w-full"
          />
        ))}
      </div>
    </section>
  )
}

function EventOverlay({ eventName }: { eventName: string }) {
  return (
    <div className="absolute inset-0 flex items-center justify-center rounded-lg opacity-100 transition-opacity duration-300 ease-in-out group-hover:opacity-100 lg:opacity-0">
      <div className="absolute inset-0 bg-black/80 opacity-75" />

      <div className="relative z-10 flex h-full w-full cursor-pointer flex-col justify-between p-4 text-left text-white">
        <strong className="font-sans text-xl">{eventName}</strong>
        <p className="flex items-center gap-1 self-end text-sm">
          View details <ArrowRight size={16} />
        </p>
      </div>
    </div>
  )
}
