'use client'

import { Suspense, useEffect, useState } from 'react'

import { ANALYTICS_NAME_USER_ACTION_FORM_EMAIL_CNN } from '@/components/app/userActionFormEmailCNN/constants'
import { LazyUserActionFormEmailCNN } from '@/components/app/userActionFormEmailCNN/lazyLoad'
import { UserActionFormEmailCNNSkeleton } from '@/components/app/userActionFormEmailCNN/skeleton'
import { FormFields } from '@/components/app/userActionFormEmailCongressperson/types'
import { UserActionFormSuccessScreen } from '@/components/app/userActionFormSuccessScreen'
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'
import { dialogContentPaddingStyles } from '@/components/ui/dialog/styles'
import { useApiResponseForUserFullProfileInfo } from '@/hooks/useApiResponseForUserFullProfileInfo'
import { useDialog } from '@/hooks/useDialog'
import { useLocale } from '@/hooks/useLocale'
import { cn } from '@/utils/web/cn'

export function UserActionFormEmailCNNDialog({
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
    analytics: ANALYTICS_NAME_USER_ACTION_FORM_EMAIL_CNN,
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
        <Suspense fallback={<UserActionFormEmailCNNSkeleton locale={locale} />}>
          {fetchUser.isLoading ? (
            <UserActionFormEmailCNNSkeleton locale={locale} />
          ) : state === 'form' ? (
            <LazyUserActionFormEmailCNN
              initialValues={initialValues}
              onCancel={() => dialogProps.onOpenChange(false)}
              onSuccess={() => setState('success')}
              user={user}
            />
          ) : (
            <div className={cn(dialogContentPaddingStyles)}>
              <UserActionFormSuccessScreen onClose={() => dialogProps.onOpenChange(false)} />
            </div>
          )}
        </Suspense>
      </DialogContent>
    </Dialog>
  )
}
