'use client'

import { UserActionFormDonate } from '@/components/app/userActionFormDonate'
import { LazyUserActionFormDonate } from '@/components/app/userActionFormDonate/lazyLoad'
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { useDialog } from '@/hooks/useDialog'
import { Suspense } from 'react'

export function UserActionFormDonateDialog({
  children,
  defaultOpen = false,
  ...formProps
}: Omit<React.ComponentProps<typeof UserActionFormDonate>, 'onCancel' | 'onSuccess'> & {
  children: React.ReactNode
  defaultOpen?: boolean
}) {
  const dialogProps = useDialog({
    initialOpen: defaultOpen,
    analytics: 'User Action Form Donate',
  })
  return (
    <Dialog {...dialogProps}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-3xl">
        <Suspense fallback={<Skeleton className="h-80 w-full" />}>
          <LazyUserActionFormDonate
            {...formProps}
            onCancel={() => dialogProps.onOpenChange(false)}
            onSuccess={() => dialogProps.onOpenChange(false)}
          />
        </Suspense>
      </DialogContent>
    </Dialog>
  )
}
