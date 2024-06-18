import { lazy } from 'react'

export const LazyUserActionFormEmailCNN = lazy(() =>
  import('@/components/app/userActionFormEmailCNN').then(m => ({
    default: m.UserActionFormEmailCNN,
  })),
)
