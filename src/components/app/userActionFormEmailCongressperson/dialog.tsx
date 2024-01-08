'use client'

import { UserActionFormEmailCongressperson } from '@/components/app/userActionFormEmailCongressperson'
import { LazyUserActionFormEmailCongressperson } from '@/components/app/userActionFormEmailCongressperson/lazyLoad'
import { UserActionFormSuccessScreen } from '@/components/app/userActionFormSuccessScreen/userActionFormSuccessScreen'
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { useApiResponseForUserFullProfileInfo } from '@/hooks/useApiResponseForUserFullProfileInfo'
import { useDialog } from '@/hooks/useDialog'
import { Suspense, useState } from 'react'

export function UserActionFormEmailCongresspersonDialog({
  children,
  defaultOpen = false,
}: {
  children: React.ReactNode
  defaultOpen?: boolean
}) {
  const dialogProps = useDialog(defaultOpen)
  const fetchUser = useApiResponseForUserFullProfileInfo()
  const [state, setState] = useState<'form' | 'success'>('form')
  const { user } = fetchUser.data || { user: null }
  return (
    <Dialog {...dialogProps}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-3xl p-0">
        <Suspense fallback={<Skeleton className="h-80 w-full" />}>
          {fetchUser.isLoading ? (
            <Skeleton className="h-80 w-full" />
          ) : state === 'form' ? (
            <LazyUserActionFormEmailCongressperson
              user={user}
              onCancel={() => dialogProps.onOpenChange(false)}
              onSuccess={() => setState('success')}
            />
          ) : (
            <UserActionFormSuccessScreen />
          )}
        </Suspense>
      </DialogContent>
    </Dialog>
  )
}
