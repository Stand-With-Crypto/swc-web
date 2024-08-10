'use client'

import { ReactNode } from 'react'

import { EventDialogContent } from '@/components/app/pageEvents/components/eventDialogContent'
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'
import { useDialog } from '@/hooks/useDialog'
import { SWCEvents } from '@/utils/shared/getSWCEvents'

interface EventDialogProps {
  event: SWCEvents[0]['data']
  trigger: ReactNode
}

export function EventDialog({ event, trigger }: EventDialogProps) {
  const dialogProps = useDialog({ analytics: 'Event Details Dialog' })

  return (
    <Dialog {...dialogProps}>
      <DialogTrigger className="flex w-full justify-center">{trigger}</DialogTrigger>
      <DialogContent a11yTitle={`State ${event.state} Events`} className="max-w-[578px]">
        <EventDialogContent event={event} />
      </DialogContent>
    </Dialog>
  )
}
