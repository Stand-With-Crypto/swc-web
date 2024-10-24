import { lazy } from 'react'

export const LazyUserActionVotingDay = lazy(() =>
  import('@/components/app/userActionVotingDay').then(m => ({
    default: m.UserActionVotingDay,
  })),
)
