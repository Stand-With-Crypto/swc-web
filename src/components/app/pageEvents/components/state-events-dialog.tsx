'use client'

import { StateEventsDialogContent } from '@/components/app/pageEvents/components/state-events-dialog-content'
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'
import { useDialog } from '@/hooks/useDialog'
import { SWCEvents } from '@/utils/shared/getSWCEvents'
import { US_MAIN_STATE_CODE_TO_DISPLAY_NAME_MAP } from '@/utils/shared/usStateUtils'

interface StateEventsDialogProps {
  state: keyof typeof US_MAIN_STATE_CODE_TO_DISPLAY_NAME_MAP
  events?: SWCEvents
}

export function StateEventsDialog({ state, events }: StateEventsDialogProps) {
  const dialogProps = useDialog({
    analytics: `${US_MAIN_STATE_CODE_TO_DISPLAY_NAME_MAP[state.toUpperCase() as keyof typeof US_MAIN_STATE_CODE_TO_DISPLAY_NAME_MAP]} Events Dialog`,
  })

  return (
    <Dialog {...dialogProps}>
      {/* This is temporary. Will be implemented with the map */}
      <DialogTrigger>State Dialog</DialogTrigger>{' '}
      <DialogContent a11yTitle={`State ${state} Events`} className="max-w-[578px]">
        <StateEventsDialogContent events={events} state={state} />
      </DialogContent>
    </Dialog>
  )
}
