import { lazy } from 'react'

export const LazyUserActionFormOptInSWC = lazy(() =>
  import('@/components/app/userActionFormOptInSWC').then(m => ({
    default: m.UserActionFormOptInSWC,
  })),
)
