import { lazy } from 'react'

export const LazyUserActionFormTweetAtPerson = lazy(() =>
  import('@/components/app/userActionFormTweetAtPerson').then(m => ({
    default: m.UserActionFormTweetAtPerson,
  })),
)
