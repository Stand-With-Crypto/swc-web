import { lazy } from 'react'

export const LazyStateEventsDialogContent = lazy(() =>
  import('@/components/app/pageEvents/components/stateEventsDialogContent').then(m => ({
    default: m.StateEventsDialogContent,
  })),
)
