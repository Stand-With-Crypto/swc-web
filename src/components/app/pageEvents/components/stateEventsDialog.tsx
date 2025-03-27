'use client'

import { Suspense } from 'react'

import { LazyStateEventsDialogContent } from '@/components/app/pageEvents/components/stateEventsDialogContentLazyload'
import { StateEventsDialogContentSkeleton } from '@/components/app/pageEvents/components/stateEventsDialogContentSkeleton'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { useDialog } from '@/hooks/useDialog'
import { US_MAIN_STATE_CODE_TO_DISPLAY_NAME_MAP } from '@/utils/shared/stateMappings/usStateUtils'
import { SWCEvents } from '@/utils/shared/zod/getSWCEvents'

interface StateEventsDialogProps {
  state: keyof typeof US_MAIN_STATE_CODE_TO_DISPLAY_NAME_MAP | null
  events?: SWCEvents
  isOpen: boolean
  setIsOpen: (open: boolean) => void
}

export function StateEventsDialog({ state, events, isOpen, setIsOpen }: StateEventsDialogProps) {
  const analytics = state
    ? `${US_MAIN_STATE_CODE_TO_DISPLAY_NAME_MAP[state.toUpperCase() as keyof typeof US_MAIN_STATE_CODE_TO_DISPLAY_NAME_MAP]} Events Dialog`
    : 'State Events Dialog'
  const dialogProps = useDialog({
    analytics: analytics,
  })

  if (!state) return null

  return (
    <Dialog {...dialogProps} onOpenChange={open => setIsOpen(open)} open={isOpen}>
      <DialogContent a11yTitle={`State ${state} Events`} className="max-w-[578px]">
        <Suspense fallback={<StateEventsDialogContentSkeleton />}>
          <LazyStateEventsDialogContent events={events} state={state} />
        </Suspense>
      </DialogContent>
    </Dialog>
  )
}
