'use client'

import { Suspense, useEffect, useState } from 'react'

import { ANALYTICS_NAME_USER_ACTION_FORM_EMAIL_CONGRESSPERSON } from '@/components/app/userActionFormEmailCongressperson/constants'
import { LazyUserActionFormEmailCongressperson } from '@/components/app/userActionFormEmailCongressperson/lazyLoad'
import { UserActionFormEmailCongresspersonSkeleton } from '@/components/app/userActionFormEmailCongressperson/skeleton'
import { UserActionFormEmailCongresspersonSuccess } from '@/components/app/userActionFormEmailCongressperson/success'
import { FormFields } from '@/components/app/userActionFormEmailCongressperson/types'
import { UserActionFormSuccessScreen } from '@/components/app/userActionFormSuccessScreen'
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'
import { dialogContentPaddingStyles } from '@/components/ui/dialog/styles'
import { useApiResponseForUserFullProfileInfo } from '@/hooks/useApiResponseForUserFullProfileInfo'
import { useDialog } from '@/hooks/useDialog'
import { useLocale } from '@/hooks/useLocale'
import { cn } from '@/utils/web/cn'

export function UserActionFormEmailCongresspersonDialog({
  children,
  defaultOpen = false,
  initialValues,
}: {
  children: React.ReactNode
  defaultOpen?: boolean
  initialValues?: FormFields
}) {
  const dialogProps = useDialog({
    initialOpen: defaultOpen,
    analytics: ANALYTICS_NAME_USER_ACTION_FORM_EMAIL_CONGRESSPERSON,
  })
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
      <DialogContent className="max-w-3xl" padding={false}>
        {/* <Suspense fallback={<UserActionFormEmailCongresspersonSkeleton locale={locale} />}>
          {fetchUser.isLoading ? (
            <UserActionFormEmailCongresspersonSkeleton locale={locale} />
          ) : state === 'form' ? (
            <LazyUserActionFormEmailCongressperson
              initialValues={initialValues}
              onCancel={() => dialogProps.onOpenChange(false)}
              onSuccess={() => setState('success')}
              user={user}
            />
          ) : (
            <div className={cn(dialogContentPaddingStyles)}>
              <UserActionFormSuccessScreen onClose={() => dialogProps.onOpenChange(false)}>
                <UserActionFormEmailCongresspersonSuccess />
              </UserActionFormSuccessScreen>
            </div>
          )}
        </Suspense> */}
        <div className={cn(dialogContentPaddingStyles, 'h-full')}>
          <UserActionFormSuccessScreen onClose={() => dialogProps.onOpenChange(false)}>
            <UserActionFormEmailCongresspersonSuccess />
          </UserActionFormSuccessScreen>
        </div>
      </DialogContent>
    </Dialog>
  )
}
