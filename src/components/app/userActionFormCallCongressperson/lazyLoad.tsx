import { lazy } from 'react'

export const LazyUserActionFormCallCongressperson = lazy(() =>
  import('@/components/app/userActionFormCallCongressperson').then(m => ({
    default: m.UserActionFormCallCongressperson,
  })),
)
