'use client'

import { ANALYTICS_NAME_USER_ACTION_FORM_EMAIL_CONGRESSPERSON } from '@/components/app/userActionFormEmailCongressperson/constants'
import { LazyUserActionFormEmailCongressperson } from '@/components/app/userActionFormEmailCongressperson/lazyLoad'
import { UserActionFormEmailCongresspersonSkeleton } from '@/components/app/userActionFormEmailCongressperson/skeleton'
import { RnParams } from '@/components/app/userActionFormEmailCongressperson/types'
import { UserActionFormSuccessScreen } from '@/components/app/userActionFormSuccessScreen'
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'
import { useApiResponseForUserFullProfileInfo } from '@/hooks/useApiResponseForUserFullProfileInfo'
import { useDialog } from '@/hooks/useDialog'
import { useLocale } from '@/hooks/useLocale'
import { Suspense, useEffect, useState } from 'react'

export function UserActionFormEmailCongresspersonDialog({
  children,
  defaultOpen = false,
  rnParams,
}: {
  children: React.ReactNode
  defaultOpen?: boolean
  rnParams: RnParams
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
    <Dialog analytics={ANALYTICS_NAME_USER_ACTION_FORM_EMAIL_CONGRESSPERSON} {...dialogProps}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-3xl" padding={false}>
        <Suspense fallback={<UserActionFormEmailCongresspersonSkeleton locale={locale} />}>
          {fetchUser.isLoading ? (
            <UserActionFormEmailCongresspersonSkeleton locale={locale} />
          ) : state === 'form' ? (
            <LazyUserActionFormEmailCongressperson
              user={user}
              rnParams={rnParams}
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
