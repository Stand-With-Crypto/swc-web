import { Button } from '@/components/ui/button'
import { NextImage } from '@/components/ui/image'
import { SWCEvents } from '@/utils/shared/getSWCEvents'

interface FeaturedEventsProps {
  events: SWCEvents
}

export function FeaturedEvents({ events }: FeaturedEventsProps) {
  const filteredPromotionalEvents = events.filter(event => !!event.data.promotedPositioning)

  const orderedPromotionalEvents = filteredPromotionalEvents.sort(
    (a, b) => a.data.promotedPositioning! - b.data.promotedPositioning!,
  )

  return (
    <section className="flex  flex-col items-center gap-4 lg:gap-8">
      {orderedPromotionalEvents.map(event => (
        <div className="flex flex-col items-start gap-4 lg:flex-row lg:gap-6" key={event.data.slug}>
          <div className="relative h-[233px] min-w-[417px]">
            <NextImage
              alt={event.data.name}
              className="object-cover object-center"
              fill
              src={event.data.image}
            />
          </div>

          <div className="grid gap-2 lg:gap-4">
            <h4 className="text-bold font-sans text-xl text-foreground lg:text-[2rem]">
              {event.data.name}
            </h4>
            <p className="font-mono text-base text-muted-foreground lg:text-xl">
              {event.data.description}
            </p>
            <Button className="mt-2 w-full lg:mt-4 lg:w-fit" variant="secondary">
              Learn more
            </Button>
          </div>
        </div>
      ))}
    </section>
  )
}
