'use client'

import { ReactNode, Suspense } from 'react'

import { LazyEventDialogContent } from '@/components/app/pageEvents/components/eventDialogContentLazyload'
import { EventDialogContentSkeleton } from '@/components/app/pageEvents/components/eventDialogContentSkeleton'
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'
import { useDialog } from '@/hooks/useDialog'
import { SWCEvent } from '@/utils/shared/zod/getSWCEvents'

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
      <DialogContent a11yTitle={`State ${event.state} Events`} className="max-w-xl" padding={false}>
        <Suspense fallback={<EventDialogContentSkeleton />}>
          <LazyEventDialogContent event={event} />
        </Suspense>
      </DialogContent>
    </Dialog>
  )
}
