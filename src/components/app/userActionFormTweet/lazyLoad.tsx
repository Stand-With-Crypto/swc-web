import { lazy } from 'react'

export const LazyUserActionFormTweet = lazy(() =>
  import('@/components/app/userActionFormTweet').then(m => ({
    default: m.UserActionFormTweet,
  })),
)
