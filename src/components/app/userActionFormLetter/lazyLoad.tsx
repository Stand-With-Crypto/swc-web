import { lazy } from 'react'

export const LazyAUUserActionFormLetter = lazy(() =>
  import('@/components/app/userActionFormLetter/au').then(m => ({
    default: m.AUUserActionFormLetter,
  })),
)

