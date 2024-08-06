'use client'

import { format } from 'date-fns'
import { Clock, Pin } from 'lucide-react'

import { eventStates } from '@/components/app/pageEvents/constants'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'
import { NextImage } from '@/components/ui/image'
import { useDialog } from '@/hooks/useDialog'

interface EventDialogProps {
  state: keyof typeof eventStates
  name: string
  description: string
  date: string
  address: string
  googleMapsLink?: string
}

export function EventDialog({
  state,
  address,
  date,
  description,
  name,
  googleMapsLink,
}: EventDialogProps) {
  const dialogProps = useDialog({ analytics: 'Event Dialog' })
  const formattedEventDate = format(new Date(date), 'EEEE M/d h:mm a')

  return (
    <Dialog {...dialogProps}>
      <DialogTrigger>Event Dialog</DialogTrigger> {/* This is temporary */}
      <DialogContent a11yTitle={`State ${state} Events`} className="max-w-[578px]">
        <div className="flex h-full flex-col items-center gap-2">
          <NextImage
            alt={`${state} shield`}
            className="mb-2 lg:mb-0"
            height={100}
            src={`/stateShields/${state}.png`}
            width={100}
          />
          <h3 className="font-sans text-xl font-bold">{name}</h3>
          <p className="text-center font-mono text-base text-muted-foreground">{description}</p>
          <p className="mt-9 flex items-center gap-2 font-mono text-sm">
            <Clock size={16} /> {formattedEventDate}
          </p>
          <p className="mb-9 mt-5 flex items-center gap-2 font-mono text-sm">
            <Pin size={16} /> {address}
          </p>
          {googleMapsLink} {/* // TODO: ADD IFRAME HERE */}
          <div className="mt-auto flex w-full flex-col-reverse items-center justify-end gap-3 lg:mt-0 lg:flex-row">
            <Button className="w-full lg:w-auto" variant="secondary">
              Get updates
            </Button>
            <Button className="w-full lg:w-auto">RSVP</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
