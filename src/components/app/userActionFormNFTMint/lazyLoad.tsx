import { lazy } from 'react'

export const LazyUserActionFormNFTMint = lazy(() =>
  import('@/components/app/userActionFormNFTMint').then(m => ({
    default: m.UserActionFormNFTMint,
  })),
)
