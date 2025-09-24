import { lazy } from 'react'

export const LazyEventDialogContent = lazy(() =>
  import('@/components/app/pageEvents/common/eventDialogContent').then(m => ({
    default: m.EventDialogContent,
  })),
)
