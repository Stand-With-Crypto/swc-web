import { lazy } from 'react'

export const LazyUserActionFormDonate = lazy(() =>
  import('@/components/app/userActionFormDonate').then(m => ({
    default: m.UserActionFormDonate,
  })),
)
