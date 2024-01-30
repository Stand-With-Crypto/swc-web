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
}: Omit<React.ComponentProps<typeof UserActionFormCallCongressperson>, 'user' | 'onClose'> & {
  children: React.ReactNode
  defaultOpen?: boolean
}) {
  const dialogProps = useDialog(defaultOpen)
  const { data, isLoading } = useApiResponseForUserFullProfileInfo()
  const { user } = data ?? { user: null }

  return (
    <Dialog {...dialogProps}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-3xl">
        {isLoading ? (
          <UserActionFormCallCongresspersonSkeleton />
        ) : (
          <Suspense fallback={<UserActionFormCallCongresspersonSkeleton />}>
            <LazyUserActionFormCallCongressperson
              {...formProps}
              onClose={() => dialogProps.onOpenChange(false)}
              user={user}
            />
          </Suspense>
        )}
      </DialogContent>
    </Dialog>
  )
}
