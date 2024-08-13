'use client'

import { ReactNode } from 'react'

import { EventDialogContent } from '@/components/app/pageEvents/components/eventDialogContent'
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'
import { useDialog } from '@/hooks/useDialog'
import { SWCEvent } from '@/utils/shared/getSWCEvents'

interface EventDialogProps {
  event: SWCEvent
  trigger: ReactNode
  triggerClassName?: string
}

export function EventDialog({ event, trigger, triggerClassName }: EventDialogProps) {
  const dialogProps = useDialog({ analytics: 'Event Details Dialog' })

  return (
    <Dialog {...dialogProps}>
      <DialogTrigger className={triggerClassName ?? 'flex w-full justify-center'}>
        {trigger}
      </DialogTrigger>
      <DialogContent
        a11yTitle={`State ${event.state} Events`}
        className="max-w-[578px]"
        padding={false}
      >
        <EventDialogContent event={event} />
      </DialogContent>
    </Dialog>
  )
}
