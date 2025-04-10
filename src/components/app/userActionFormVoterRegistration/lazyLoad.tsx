import { lazy } from 'react'

export const LazyUserActionFormVoterRegistration = lazy(() =>
  import('@/components/app/userActionFormVoterRegistration').then(m => ({
    default: m.UserActionFormVoterRegistration,
  })),
)
