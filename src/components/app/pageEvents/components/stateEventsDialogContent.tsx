'use client'

import { format, isAfter } from 'date-fns'

import { EventDialog } from '@/components/app/pageEvents/components/eventDialog'
import { NextImage } from '@/components/ui/image'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { usePreventOverscroll } from '@/hooks/usePreventOverscroll'
import { pluralize } from '@/utils/shared/pluralize'
import { US_STATE_CODE_TO_DISPLAY_NAME_MAP } from '@/utils/shared/usStateUtils'
import { SWCEvent, SWCEvents } from '@/utils/shared/zod/getSWCEvents'

interface StateEventsDialogProps {
  state: keyof typeof US_STATE_CODE_TO_DISPLAY_NAME_MAP
  events?: SWCEvents
}

export function StateEventsDialogContent({ state, events }: StateEventsDialogProps) {
  usePreventOverscroll()

  const parsedState = state.toUpperCase() as keyof typeof US_STATE_CODE_TO_DISPLAY_NAME_MAP
  const stateEvents =
    events?.filter(event => event.data.state?.toLowerCase() === state.toLowerCase()) ?? []

  const orderedResult = stateEvents.sort((a, b) => {
    const aDate = a.data.time ? new Date(`${a.data.date}T${a.data.time}`) : new Date(a.data.date)
    const bDate = b.data.time ? new Date(`${b.data.date}T${b.data.time}`) : new Date(b.data.date)

    return isAfter(aDate, bDate) ? 1 : -1
  })

  return (
    <div className="flex flex-col items-center gap-2 pb-4">
      <NextImage
        alt={`${parsedState} shield`}
        className="mb-2 lg:mb-0"
        height={100}
        src={`/stateShields/${parsedState}.png`}
        width={100}
      />

      <h3 className="font-sans text-xl font-bold">
        Events in {US_STATE_CODE_TO_DISPLAY_NAME_MAP[parsedState]}
      </h3>
      <p className="font-mono text-base text-muted-foreground">
        There {pluralize({ singular: 'is', plural: 'are', count: orderedResult?.length ?? 0 })}{' '}
        {orderedResult?.length ?? 0} Stand With Crypto{' '}
        {pluralize({ singular: 'event', count: orderedResult?.length ?? 0 })} in{' '}
        {US_STATE_CODE_TO_DISPLAY_NAME_MAP[parsedState]}.
      </p>

      <ScrollArea className="w-full">
        {orderedResult?.length > 0 ? (
          <div className="mt-6 flex w-full flex-col gap-4 px-8 lg:max-h-96">
            {orderedResult.map(event => (
              <EventDialog
                event={event.data}
                key={event.data.slug}
                trigger={<StateDialogEventCard event={event.data} />}
              />
            ))}
          </div>
        ) : null}
        <ScrollBar />
      </ScrollArea>
    </div>
  )
}

interface StateDialogEventCardProps {
  event: SWCEvent
}

function StateDialogEventCard({ event }: StateDialogEventCardProps) {
  const formattedEventDate = format(new Date(`${event.date}T00:00`), 'MMMM d, yyyy')

  return (
    <div className="flex w-full max-w-[856px] flex-col gap-2 rounded-2xl bg-backgroundAlternate p-6 pt-4 transition hover:bg-backgroundAlternate/60 lg:flex-row lg:items-center lg:p-4 lg:pt-4">
      <NextImage
        alt={`${event.state} shield`}
        className="mb-2 lg:mb-0"
        height={70}
        src={`/stateShields/${event.state}.png`}
        width={70}
      />

      <strong className="block lg:hidden">{event.name}</strong>
      <p className="block text-muted-foreground lg:hidden">
        {event.city}, {event.state} • {formattedEventDate}
      </p>

      <div className="hidden flex-col items-start lg:flex">
        <strong className="text-left">{event.name}</strong>
        <p className="text-muted-foreground">
          {event.city}, {event.state} • {formattedEventDate}
        </p>
      </div>
    </div>
  )
}
