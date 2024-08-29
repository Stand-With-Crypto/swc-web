'use client'

import { Suspense, useEffect, useState } from 'react'

import { ANALYTICS_NAME_USER_ACTION_FORM_EMAIL_ABC } from '@/components/app/userActionFormEmailABC/constants'
import { LazyUserActionFormEmailABC } from '@/components/app/userActionFormEmailABC/lazyLoad'
import { UserActionFormEmailABCSkeleton } from '@/components/app/userActionFormEmailABC/skeleton'
import { UserActionFormEmailABCSuccess } from '@/components/app/userActionFormEmailABC/success'
import { UserActionEmailABCFormFields } from '@/components/app/userActionFormEmailABC/types'
import { UserActionFormSuccessScreen } from '@/components/app/userActionFormSuccessScreen'
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'
import { dialogContentPaddingStyles } from '@/components/ui/dialog/styles'
import { useApiResponseForUserFullProfileInfo } from '@/hooks/useApiResponseForUserFullProfileInfo'
import { useDialog } from '@/hooks/useDialog'
import { cn } from '@/utils/web/cn'

export function UserActionFormEmailABCDialog({
  children,
  defaultOpen = false,
  initialValues,
}: {
  children: React.ReactNode
  defaultOpen?: boolean
  initialValues?: UserActionEmailABCFormFields
}) {
  const dialogProps = useDialog({
    initialOpen: defaultOpen,
    analytics: ANALYTICS_NAME_USER_ACTION_FORM_EMAIL_ABC,
  })
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
      <DialogContent a11yTitle="ABC debate email" className="max-w-3xl" padding={false}>
        <Suspense fallback={<UserActionFormEmailABCSkeleton />}>
          {fetchUser.isLoading ? (
            <UserActionFormEmailABCSkeleton />
          ) : state === 'form' ? (
            <LazyUserActionFormEmailABC
              initialValues={initialValues}
              onCancel={() => dialogProps.onOpenChange(false)}
              onSuccess={() => setState('success')}
              user={user}
            />
          ) : (
            <div className={cn(dialogContentPaddingStyles)}>
              <UserActionFormSuccessScreen onClose={() => dialogProps.onOpenChange(false)}>
                <UserActionFormEmailABCSuccess />
              </UserActionFormSuccessScreen>
            </div>
          )}
        </Suspense>
      </DialogContent>
    </Dialog>
  )
}
