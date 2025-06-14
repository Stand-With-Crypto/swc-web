import { lazy } from 'react'

export const LazyUSUserActionFormEmailCongressperson = lazy(() =>
  import('@/components/app/userActionFormEmailCongressperson/us').then(m => ({
    default: m.USUserActionFormEmailCongressperson,
  })),
)

export const LazyAUUserActionFormEmailCongressperson = lazy(() =>
  import('@/components/app/userActionFormEmailCongressperson/au').then(m => ({
    default: m.AUUserActionFormEmailCongressperson,
  })),
)

export const LazyCAUserActionFormEmailCongressperson = lazy(() =>
  import('@/components/app/userActionFormEmailCongressperson/ca').then(m => ({
    default: m.CAUserActionFormEmailCongressperson,
  })),
)

export const LazyGBUserActionFormEmailCongressperson = lazy(() =>
  import('@/components/app/userActionFormEmailCongressperson/gb').then(m => ({
    default: m.GBUserActionFormEmailCongressperson,
  })),
)
