import { lazy } from 'react'

export const LazyUserActionFormVoterAttestation = lazy(() =>
  import('@/components/app/userActionFormVoterAttestation').then(m => ({
    default: m.UserActionFormVoterAttestation,
  })),
)
