import { lazy } from 'react'

export const LazyUserActionFormEmailCongressperson = lazy(() =>
  import('@/components/app/userActionFormEmailCongressperson').then(m => ({
    default: m.UserActionFormEmailCongressperson,
  })),
)
