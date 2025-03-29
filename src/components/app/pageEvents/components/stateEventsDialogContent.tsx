'use client'

import { format, isAfter } from 'date-fns'

import { EventDialog } from '@/components/app/pageEvents/components/eventDialog'
import { NoEventsCTA } from '@/components/app/pageEvents/components/noEventsCTA'
import { getUniqueEventKey } from '@/components/app/pageEvents/utils/getUniqueEventKey'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { StateShield } from '@/components/ui/stateShield'
import { usePreventOverscroll } from '@/hooks/usePreventOverscroll'
import { pluralize } from '@/utils/shared/pluralize'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { SWCEvent, SWCEvents } from '@/utils/shared/zod/getSWCEvents'

interface StateEventsDialogProps {
  state: {
    code: string
    name: string
  }
  events?: SWCEvents | null
  countryCode: SupportedCountryCodes
}

export function StateEventsDialogContent({ state, events, countryCode }: StateEventsDialogProps) {
  usePreventOverscroll()

  const parsedState = state.code.toUpperCase()
  const stateEvents =
    events?.filter(event => event.data.state?.toLowerCase() === state.code.toLowerCase()) ?? []

  const orderedResult = stateEvents.sort((a, b) => {
    const aDate = a.data.time ? new Date(`${a.data.date}T${a.data.time}`) : new Date(a.data.date)
    const bDate = b.data.time ? new Date(`${b.data.date}T${b.data.time}`) : new Date(b.data.date)

    return isAfter(aDate, bDate) ? 1 : -1
  })

  return (
    <div className="flex flex-col items-center gap-2 p-6">
      <StateShield
        className="mb-2 lg:mb-0"
        countryCode={countryCode}
        size={100}
        state={parsedState}
      />

      <h3 className="font-sans text-xl font-bold">Events in {state.name}</h3>
      <p className="font-mono text-base text-muted-foreground">
        There {pluralize({ singular: 'is', plural: 'are', count: orderedResult?.length ?? 0 })}{' '}
        {orderedResult?.length ?? 0} Stand With Crypto{' '}
        {pluralize({ singular: 'event', count: orderedResult?.length ?? 0 })} in {state.name}.
      </p>

      <ScrollArea className="w-full">
        {orderedResult?.length > 0 ? (
          <div className="mt-6 flex w-full flex-col gap-4 px-8 lg:max-h-96">
            {orderedResult.map(event => (
              <EventDialog
                event={event.data}
                key={getUniqueEventKey(event.data)}
                trigger={<StateDialogEventCard countryCode={countryCode} event={event.data} />}
              />
            ))}
          </div>
        ) : (
          <NoEventsCTA className="mt-6" />
        )}
        <ScrollBar />
      </ScrollArea>
    </div>
  )
}

interface StateDialogEventCardProps {
  event: SWCEvent
  countryCode: SupportedCountryCodes
}

function StateDialogEventCard({ event, countryCode }: StateDialogEventCardProps) {
  const formattedEventDate = format(new Date(`${event.date}T00:00`), 'MMMM d, yyyy')

  return (
    <div className="flex w-full max-w-[856px] flex-col gap-2 rounded-2xl bg-backgroundAlternate p-6 pt-4 transition hover:bg-backgroundAlternate/60 lg:flex-row lg:items-center lg:p-4 lg:pt-4">
      <StateShield
        className="mb-2 lg:mb-0"
        countryCode={countryCode}
        size={70}
        state={event.state}
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
