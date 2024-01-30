'use client'

import { LazyUserActionFormEmailCongressperson } from '@/components/app/userActionFormEmailCongressperson/lazyLoad'
import { UserActionFormEmailCongresspersonSkeleton } from '@/components/app/userActionFormEmailCongressperson/skeleton'
import { UserActionFormSuccessScreen } from '@/components/app/userActionFormSuccessScreen'
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'
import { useApiResponseForUserFullProfileInfo } from '@/hooks/useApiResponseForUserFullProfileInfo'
import { useDialog } from '@/hooks/useDialog'
import { useLocale } from '@/hooks/useLocale'
import { Suspense, useEffect, useState } from 'react'

export function UserActionFormEmailCongresspersonDialog({
  children,
  defaultOpen = false,
}: {
  children: React.ReactNode
  defaultOpen?: boolean
}) {
  const dialogProps = useDialog(defaultOpen)
  const locale = useLocale()
  const fetchUser = useApiResponseForUserFullProfileInfo()
  const [state, setState] = useState<'form' | 'success'>('form')
  const { user } = fetchUser.data || { user: null }
  useEffect(() => {
    if (!dialogProps.open && state !== 'form') {
      setState('form')
    }
  }, [dialogProps.open, state])
  return (
    <Dialog {...dialogProps}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-3xl px-0">
        <Suspense fallback={<UserActionFormEmailCongresspersonSkeleton locale={locale} />}>
          {fetchUser.isLoading ? (
            <UserActionFormEmailCongresspersonSkeleton locale={locale} />
          ) : state === 'form' ? (
            <LazyUserActionFormEmailCongressperson
              user={user}
              onCancel={() => dialogProps.onOpenChange(false)}
              onSuccess={() => setState('success')}
            />
          ) : (
            <div className="px-6">
              <UserActionFormSuccessScreen onClose={() => dialogProps.onOpenChange(false)} />
            </div>
          )}
        </Suspense>
      </DialogContent>
    </Dialog>
  )
}
