import { lazy } from 'react'

export const LazyUserActionFormVoterRegistrationNft = lazy(() =>
  import('@/components/app/userActionFormVoterRegistrationNft').then(m => ({
    default: m.UserActionFormVoterRegistrationNft,
  })),
)
