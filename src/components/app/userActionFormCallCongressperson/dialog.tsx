'use client'

import { UserActionFormCallCongressperson } from '@/components/app/userActionFormCallCongressperson'
import { LazyUserActionFormCallCongressperson } from '@/components/app/userActionFormCallCongressperson/lazyLoad'
import { UserActionFormCallCongresspersonSkeleton } from '@/components/app/userActionFormCallCongressperson/skeleton'
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'
import { useApiResponseForUserFullProfileInfo } from '@/hooks/useApiResponseForUserFullProfileInfo'
import { useDialog } from '@/hooks/useDialog'
import { Suspense } from 'react'

export function UserActionFormCallCongresspersonDialog({
  children,
  defaultOpen = false,
  ...formProps
}: Omit<
  React.ComponentProps<typeof UserActionFormCallCongressperson>,
  'user' | 'onCancel' | 'onSuccess'
> & {
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
        <Suspense fallback={<UserActionFormCallCongresspersonSkeleton />}>
          <LazyUserActionFormCallCongressperson {...formProps} user={user} />
        </Suspense>
      </DialogContent>
    </Dialog>
  )
}
