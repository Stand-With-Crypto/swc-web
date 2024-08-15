import { lazy } from 'react'

export const LazyEventDialogContent = lazy(() =>
  import('@/components/app/pageEvents/components/eventDialogContent').then(m => ({
    default: m.EventDialogContent,
  })),
)
