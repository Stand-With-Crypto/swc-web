'use client'

import { Suspense } from 'react'

import { LazyStateEventsDialogContent } from '@/components/app/pageEvents/components/stateEventsDialogContentLazyload'
import { StateEventsDialogContentSkeleton } from '@/components/app/pageEvents/components/stateEventsDialogContentSkeleton'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { useDialog } from '@/hooks/useDialog'
import { SWCEvents } from '@/utils/shared/zod/getSWCEvents'
import { useCountryCode } from '@/hooks/useCountryCode'

export interface StateEventsDialogProps {
  state: {
    code: string
    name: string
  } | null
  events?: SWCEvents
  isOpen: boolean
  setIsOpen: (open: boolean) => void
}

export function StateEventsDialog({ state, events, isOpen, setIsOpen }: StateEventsDialogProps) {
  const analytics = state ? `${state.name} Events Dialog` : 'State Events Dialog'
  const dialogProps = useDialog({
    analytics: analytics,
  })
  const countryCode = useCountryCode()

  if (!state) return null

  return (
    <Dialog {...dialogProps} onOpenChange={open => setIsOpen(open)} open={isOpen}>
      <DialogContent a11yTitle={`State ${state.name} Events`} className="max-w-[578px]">
        <Suspense fallback={<StateEventsDialogContentSkeleton />}>
          <LazyStateEventsDialogContent events={events} state={state} countryCode={countryCode} />
        </Suspense>
      </DialogContent>
    </Dialog>
  )
}
