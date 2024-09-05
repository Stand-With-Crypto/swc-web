import { lazy } from 'react'

export const LazyUserActionFormEmailDebate = lazy(() =>
  import('@/components/app/userActionFormEmailDebate').then(m => ({
    default: m.UserActionFormEmailDebate,
  })),
)
