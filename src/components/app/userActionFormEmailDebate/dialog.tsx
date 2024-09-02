'use client'

import { Suspense, useEffect, useState } from 'react'

import { ANALYTICS_NAME_USER_ACTION_FORM_EMAIL_DEBATE } from '@/components/app/userActionFormEmailDebate/constants'
import { LazyUserActionFormEmailDebate } from '@/components/app/userActionFormEmailDebate/lazyLoad'
import { UserActionFormEmailDebateSkeleton } from '@/components/app/userActionFormEmailDebate/skeleton'
import { UserActionFormEmailDebateSuccess } from '@/components/app/userActionFormEmailDebate/success'
import { UserActionEmailDebateFormFields } from '@/components/app/userActionFormEmailDebate/types'
import { UserActionFormSuccessScreen } from '@/components/app/userActionFormSuccessScreen'
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'
import { dialogContentPaddingStyles } from '@/components/ui/dialog/styles'
import { useApiResponseForUserFullProfileInfo } from '@/hooks/useApiResponseForUserFullProfileInfo'
import { useDialog } from '@/hooks/useDialog'
import { cn } from '@/utils/web/cn'

export function UserActionFormEmailDebateDialog({
  children,
  defaultOpen = false,
  initialValues,
}: {
  children: React.ReactNode
  defaultOpen?: boolean
  initialValues?: UserActionEmailDebateFormFields
}) {
  const dialogProps = useDialog({
    initialOpen: defaultOpen,
    analytics: ANALYTICS_NAME_USER_ACTION_FORM_EMAIL_DEBATE,
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
        <Suspense fallback={<UserActionFormEmailDebateSkeleton />}>
          {fetchUser.isLoading ? (
            <UserActionFormEmailDebateSkeleton />
          ) : state === 'form' ? (
            <LazyUserActionFormEmailDebate
              initialValues={initialValues}
              onCancel={() => dialogProps.onOpenChange(false)}
              onSuccess={() => setState('success')}
              user={user}
            />
          ) : (
            <div className={cn(dialogContentPaddingStyles)}>
              <UserActionFormSuccessScreen onClose={() => dialogProps.onOpenChange(false)}>
                <UserActionFormEmailDebateSuccess />
              </UserActionFormSuccessScreen>
            </div>
          )}
        </Suspense>
      </DialogContent>
    </Dialog>
  )
}
