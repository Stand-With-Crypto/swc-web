import Balancer from 'react-wrap-balancer'

import { Button } from '@/components/ui/button'
import { NextImage } from '@/components/ui/image'
import { SWCEvents } from '@/utils/shared/getSWCEvents'

interface PromotedEventsProps {
  events: SWCEvents
}

export function PromotedEvents({ events }: PromotedEventsProps) {
  const filteredPromotionalEvents = events.filter(event => !!event.data.promotedPositioning)

  const orderedPromotionalEvents = filteredPromotionalEvents.sort(
    (a, b) => a.data.promotedPositioning! - b.data.promotedPositioning!,
  )

  return (
    <section className="flex flex-col items-center gap-8">
      {orderedPromotionalEvents.map(event => (
        <div
          className="flex flex-col items-center gap-4 lg:flex-row lg:gap-6"
          key={event.data.slug}
        >
          <div className="relative h-[182px] min-w-[271px]">
            <NextImage
              alt={event.data.name}
              className="object-cover object-center"
              fill
              src={event.data.image}
            />
          </div>

          <div className="grid gap-2">
            <h4 className="text-bold font-sans text-xl text-foreground">{event.data.name}</h4>
            <p className="font-mono text-base text-muted-foreground">
              <Balancer>{event.data.description}</Balancer>
            </p>

            <Button asChild className="mt-2 w-full lg:mt-4 lg:w-fit" variant="secondary">
              <a href={event.data.rsvpUrl} target="_blank">
                RSVP
              </a>
            </Button>
          </div>
        </div>
      ))}
    </section>
  )
}
