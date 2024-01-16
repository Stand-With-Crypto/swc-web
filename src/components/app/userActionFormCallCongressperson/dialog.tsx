'use client'

import { UserActionFormCallCongressperson } from '@/components/app/userActionFormCallCongressperson'
import { LazyUserActionFormCallCongressperson } from '@/components/app/userActionFormCallCongressperson/lazyLoad'
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { useApiResponseForUserFullProfileInfo } from '@/hooks/useApiResponseForUserFullProfileInfo'
import { useDialog } from '@/hooks/useDialog'
import { Suspense } from 'react'

export function UserActionFormCallCongresspersonDialog({
  children,
  defaultOpen = false,
  ...formProps
}: Omit<React.ComponentProps<typeof UserActionFormCallCongressperson>, 'onCancel' | 'onSuccess'> & {
  children: React.ReactNode
  defaultOpen?: boolean
}) {
  const dialogProps = useDialog(defaultOpen)
  const fetchUser = useApiResponseForUserFullProfileInfo()
  const { user } = fetchUser.data || { user: null }

  return (
    <Dialog {...dialogProps}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-3xl p-0">
        <Suspense fallback={<Skeleton className="h-80 w-full" />}>
          <LazyUserActionFormCallCongressperson
            {...formProps}
            user={user}
            onCancel={() => dialogProps.onOpenChange(false)}
            onSuccess={() => dialogProps.onOpenChange(false)}
          />
        </Suspense>
      </DialogContent>
    </Dialog>
  )
}
