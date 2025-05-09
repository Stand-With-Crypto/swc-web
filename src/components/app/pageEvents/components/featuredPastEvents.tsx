import { ArrowRight } from 'lucide-react'

import { EventDialog } from '@/components/app/pageEvents/components/eventDialog'
import { getUniqueEventKey } from '@/components/app/pageEvents/utils/getUniqueEventKey'
import { NextImage } from '@/components/ui/image'
import { PageTitle } from '@/components/ui/pageTitleText'
import { SWCEvents } from '@/utils/shared/zod/getSWCEvents'
import { cn } from '@/utils/web/cn'

interface FeaturedPastEventsProps {
  events: SWCEvents
}

export function FeaturedPastEvents({ events }: FeaturedPastEventsProps) {
  return (
    <section className="grid w-full gap-4">
      <PageTitle as="h3" className="mb-2">
        Featured past events
      </PageTitle>

      <div
        className={cn('grid gap-4', {
          'md:grid-cols-2 lg:grid-cols-3': events.length > 2,
          'md:grid-flow-col md:justify-center': events.length < 3,
        })}
      >
        {events.map(event => (
          <EventDialog
            event={event.data}
            key={getUniqueEventKey(event.data)}
            trigger={
              <div
                className={cn('group relative w-full', {
                  'md:w-[345px]': events.length < 3,
                })}
                key={getUniqueEventKey(event.data)}
              >
                <div className="relative h-[222px] min-w-[345px] lg:h-[300px] lg:min-w-[300px]">
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
