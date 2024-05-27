'use client'

import dynamic from 'next/dynamic'

import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'
import { LoadingOverlay } from '@/components/ui/loadingOverlay'
import { useDialog } from '@/hooks/useDialog'

const UserActionFormShareOnTwitter = dynamic(
  () =>
    import('@/components/app/userActionFormShareOnTwitter').then(
      mod => mod.UserActionFormShareOnTwitter,
    ),
  {
    loading: () => (
      <div className="min-h-[400px]">
        <LoadingOverlay />
      </div>
    ),
  },
)

export const ANALYTICS_NAME_USER_ACTION_FORM_SHARE_ON_TWITTER = 'User Action Form Share on Twitter'

export function UserActionFormShareOnTwitterDialog({
  children,
  defaultOpen = false,
}: {
  children: React.ReactNode
  defaultOpen?: boolean
}) {
  const dialogProps = useDialog({
    initialOpen: defaultOpen,
    analytics: ANALYTICS_NAME_USER_ACTION_FORM_SHARE_ON_TWITTER,
  })

  return (
    <Dialog {...dialogProps}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-3xl">
        <UserActionFormShareOnTwitter onClose={() => dialogProps.onOpenChange(false)} />
      </DialogContent>
    </Dialog>
  )
}
