import { lazy } from 'react'

export const LazyUserActionFormEmailABC = lazy(() =>
  import('@/components/app/userActionFormEmailABC').then(m => ({
    default: m.UserActionFormEmailABC,
  })),
)
