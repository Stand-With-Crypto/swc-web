'use client'

import { format } from 'date-fns'

import { eventStates } from '@/components/app/pageEvents/constants'
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'
import { NextImage } from '@/components/ui/image'
import { useDialog } from '@/hooks/useDialog'

interface StateEventsDialogProps {
  state: keyof typeof eventStates
}

export function StateEventsDialog({ state }: StateEventsDialogProps) {
  const dialogProps = useDialog({ analytics: 'State Events Dialog' })

  return (
    <Dialog {...dialogProps}>
      <DialogTrigger>State Dialog</DialogTrigger> {/* This is temporary */}
      <DialogContent a11yTitle={`State ${state} Events`} className="max-w-[578px]">
        <div className="flex flex-col items-center gap-2 pb-4">
          <NextImage
            alt={`${state} shield`}
            className="mb-2 lg:mb-0"
            height={100}
            src={`/stateShields/${state}.png`}
            width={100}
          />

          <h3 className="font-sans text-xl font-bold">Events in {eventStates[state]}</h3>
          <p className="font-mono text-base text-muted-foreground">
            There are 2 Stand With Crypto events in {eventStates[state]}.
          </p>

          <div className="mt-6 flex w-full flex-col gap-4 overflow-y-auto px-8 lg:max-h-96">
            <StateDialogEventCard
              city="Orlando"
              date={new Date().toISOString()}
              name="Global Advisory Council Meeting"
              state="FL"
            />

            <StateDialogEventCard
              city="Orlando"
              date={new Date().toISOString()}
              name="Global Advisory Council Meeting"
              state="FL"
            />
            <StateDialogEventCard
              city="Orlando"
              date={new Date().toISOString()}
              name="Global Advisory Council Meeting"
              state="FL"
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

interface StateDialogEventCardProps {
  state: keyof typeof eventStates
  name: string
  city: string
  date: string
}

function StateDialogEventCard({ state, city, date, name }: StateDialogEventCardProps) {
  const formattedEventDate = format(new Date(date), 'MMMM d, yyyy')

  return (
    <div className="flex w-full max-w-[856px] flex-col gap-2 rounded-2xl bg-backgroundAlternate p-6 pt-4 lg:flex-row lg:items-center lg:p-4 lg:pt-4">
      <NextImage
        alt={`${state} shield`}
        className="mb-2 lg:mb-0"
        height={70}
        src={`/stateShields/${state}.png`}
        width={70}
      />

      <strong className="block lg:hidden">{name}</strong>
      <p className="block text-muted-foreground lg:hidden">
        {city}, {state} • {formattedEventDate}
      </p>

      <div className="hidden flex-col items-start lg:flex">
        <strong>{name}</strong>
        <p className="text-muted-foreground">
          {city}, {state} • {formattedEventDate}
        </p>
      </div>
    </div>
  )
}
