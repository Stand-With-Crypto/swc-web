'use client'

import { StateEventsDialogContent } from '@/components/app/pageEvents/components/stateEventsDialogContent'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { useDialog } from '@/hooks/useDialog'
import { SWCEvents } from '@/utils/shared/getSWCEvents'
import { US_MAIN_STATE_CODE_TO_DISPLAY_NAME_MAP } from '@/utils/shared/usStateUtils'

interface StateEventsDialogProps {
  state: keyof typeof US_MAIN_STATE_CODE_TO_DISPLAY_NAME_MAP | null
  events?: SWCEvents
  isOpen: boolean
  setIsOpen: (open: boolean) => void
}

export function StateEventsDialog({ state, events, isOpen, setIsOpen }: StateEventsDialogProps) {
  const dialogProps = useDialog({
    analytics: `${US_MAIN_STATE_CODE_TO_DISPLAY_NAME_MAP[state?.toUpperCase() as keyof typeof US_MAIN_STATE_CODE_TO_DISPLAY_NAME_MAP]} Events Dialog`,
  })

  if (!state) return null

  return (
    <Dialog {...dialogProps} onOpenChange={open => setIsOpen(open)} open={isOpen}>
      <DialogContent a11yTitle={`State ${state} Events`} className="max-w-[578px]">
        <StateEventsDialogContent events={events} state={state} />
      </DialogContent>
    </Dialog>
  )
}
