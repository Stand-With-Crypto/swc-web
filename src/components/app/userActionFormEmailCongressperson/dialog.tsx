'use client'

import { UserActionFormEmailCongressperson } from '@/components/app/userActionFormEmailCongressperson'
import { LazyUserActionFormEmailCongressperson } from '@/components/app/userActionFormEmailCongressperson/lazyLoad'
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { useDialog } from '@/hooks/useDialog'
import { Suspense } from 'react'

export function UserActionFormEmailCongresspersonDialog({
  children,
  defaultOpen = false,
  ...formProps
}: Omit<
  React.ComponentProps<typeof UserActionFormEmailCongressperson>,
  'onCancel' | 'onSuccess'
> & {
  children: React.ReactNode
  defaultOpen?: boolean
}) {
  const dialogProps = useDialog(defaultOpen)
  return (
    <Dialog {...dialogProps}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-3xl md:px-12 md:py-16">
        <Suspense fallback={<Skeleton className="h-80 w-full" />}>
          <LazyUserActionFormEmailCongressperson
            {...formProps}
            onCancel={() => dialogProps.onOpenChange(false)}
            onSuccess={() => dialogProps.onOpenChange(false)}
          />
        </Suspense>
      </DialogContent>
    </Dialog>
  )
}
