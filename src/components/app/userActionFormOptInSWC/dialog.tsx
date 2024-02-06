'use client'

import { UserActionFormOptInSWC } from '@/components/app/userActionFormOptInSWC'
import { LazyUserActionFormOptInSWC } from '@/components/app/userActionFormOptInSWC/lazyLoad'
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { useDialog } from '@/hooks/useDialog'
import { Suspense } from 'react'

export function UserActionFormOptInSWCDialog({
  children,
  defaultOpen = false,
  ...formProps
}: Omit<React.ComponentProps<typeof UserActionFormOptInSWC>, 'onCancel' | 'onSuccess'> & {
  children: React.ReactNode
  defaultOpen?: boolean
}) {
  const dialogProps = useDialog({
    initialOpen: defaultOpen,
    analytics: 'User Action Form Opt In',
  })
  return (
    <Dialog {...dialogProps}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-3xl">
        <Suspense fallback={<Skeleton className="h-80 w-full" />}>
          <LazyUserActionFormOptInSWC
            {...formProps}
            onCancel={() => dialogProps.onOpenChange(false)}
            onSuccess={() => dialogProps.onOpenChange(false)}
          />
        </Suspense>
      </DialogContent>
    </Dialog>
  )
}
