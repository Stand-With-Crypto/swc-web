import { lazy } from 'react'

export const LazyStateEventsDialog = lazy(() =>
  import('@/components/app/pageEvents/components/stateEventsDialog').then(m => ({
    default: m.StateEventsDialog,
  })),
)
