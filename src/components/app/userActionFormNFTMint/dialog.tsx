'use client'

import { Suspense } from 'react'

import { LazyUserActionFormNFTMint } from '@/components/app/userActionFormNFTMint/lazyLoad'
import { UserActionFormNFTMintSkeleton } from '@/components/app/userActionFormNFTMint/skeleton'
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'
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
    <Dialog {...dialogProps}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-3xl">
        <Suspense fallback={<UserActionFormNFTMintSkeleton />}>
          <LazyUserActionFormNFTMint />
        </Suspense>
      </DialogContent>
    </Dialog>
  )
}
