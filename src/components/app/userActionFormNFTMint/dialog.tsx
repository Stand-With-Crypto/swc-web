'use client'

import { Suspense } from 'react'

import { UserActionFormDialog } from '@/components/app/userActionFormCommon/dialog'
import { LazyUserActionFormNFTMint } from '@/components/app/userActionFormNFTMint/lazyLoad'
import { UserActionFormNFTMintSkeleton } from '@/components/app/userActionFormNFTMint/skeleton'
import { useDialog } from '@/hooks/useDialog'

export function UserActionFormNFTMintDialog({
  children,
  defaultOpen = false,
}: {
  children: React.ReactNode
  defaultOpen?: boolean
}) {
  const dialogProps = useDialog({
    initialOpen: defaultOpen,
    analytics: 'User Action Form NFT Mint',
  })

  return (
    <UserActionFormDialog {...dialogProps} trigger={children}>
      <Suspense fallback={<UserActionFormNFTMintSkeleton />}>
        <LazyUserActionFormNFTMint onFinished={() => dialogProps.onOpenChange(false)} />
      </Suspense>
    </UserActionFormDialog>
  )
}
