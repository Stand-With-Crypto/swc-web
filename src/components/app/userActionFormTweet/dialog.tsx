'use client'

import { UserActionFormTweet } from '@/components/app/userActionFormTweet'
import { LazyUserActionFormTweet } from '@/components/app/userActionFormTweet/lazyLoad'
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { useDialog } from '@/hooks/useDialog'
import { Suspense } from 'react'

export function UserActionFormTweetDialog({
  children,
  defaultOpen = false,
  ...formProps
}: Omit<React.ComponentProps<typeof UserActionFormTweet>, 'onCancel' | 'onSuccess'> & {
  children: React.ReactNode
  defaultOpen?: boolean
}) {
  const dialogProps = useDialog(defaultOpen)
  return (
    <Dialog {...dialogProps}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-3xl p-0">
        <Suspense fallback={<Skeleton className="h-80 w-full" />}>
          <LazyUserActionFormTweet
            {...formProps}
            onCancel={() => dialogProps.onOpenChange(false)}
            onSuccess={() => dialogProps.onOpenChange(false)}
          />
        </Suspense>
      </DialogContent>
    </Dialog>
  )
}
