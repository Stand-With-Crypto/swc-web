import { lazy } from 'react'

export const LazyStateEventsDialogContent = lazy(() =>
  import('@/components/app/pageEvents/common/stateEventsDialogContent').then(m => ({
    default: m.StateEventsDialogContent,
  })),
)
