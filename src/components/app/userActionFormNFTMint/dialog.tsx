'use client'

import { UserActionFormNFTMint } from '@/components/app/userActionFormNFTMint'
import { LazyUserActionFormNFTMint } from '@/components/app/userActionFormNFTMint/lazyLoad'
import { UserActionFormNFTMintSkeleton } from '@/components/app/userActionFormNFTMint/skeleton'
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'
import { useDialog } from '@/hooks/useDialog'
import { Suspense } from 'react'

export function UserActionFormNFTMintDialog({
  children,
  defaultOpen = false,
  ...formProps
}: Omit<React.ComponentProps<typeof UserActionFormNFTMint>, 'onCancel' | 'onSuccess'> & {
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
          <LazyUserActionFormNFTMint
            {...formProps}
            onCancel={() => dialogProps.onOpenChange(false)}
            onSuccess={() => dialogProps.onOpenChange(false)}
          />
        </Suspense>
      </DialogContent>
    </Dialog>
  )
}
