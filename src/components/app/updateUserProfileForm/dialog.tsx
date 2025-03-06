'use client'

import { Suspense } from 'react'

import { UpdateUserProfileFormContainer } from '@/components/app/updateUserProfileForm'
import { ANALYTICS_NAME_UPDATE_USER_PROFILE_FORM } from '@/components/app/updateUserProfileForm/constants'
import { LazyUpdateUserProfileForm } from '@/components/app/updateUserProfileForm/lazyLoad'
import { OPEN_UPDATE_USER_PROFILE_FORM_QUERY_PARAM_KEY } from '@/components/app/updateUserProfileForm/queryParamConfig'
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { useQueryParamDialog } from '@/hooks/useQueryParamDialog'

export function UpdateUserProfileFormDialog({
  children,
  ...formProps
}: Omit<React.ComponentProps<typeof UpdateUserProfileFormContainer>, 'onCancel' | 'onSuccess'> & {
  children: React.ReactNode
}) {
  const dialogProps = useQueryParamDialog({
    queryParamKey: OPEN_UPDATE_USER_PROFILE_FORM_QUERY_PARAM_KEY,
  })
  return (
    <Dialog analytics={ANALYTICS_NAME_UPDATE_USER_PROFILE_FORM} {...dialogProps}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent a11yTitle="Update user form" className="max-w-xl px-0 md:px-0">
        <Suspense fallback={<Skeleton className="h-80 w-full" />}>
          <LazyUpdateUserProfileForm
            {...formProps}
            onSuccess={() => dialogProps.onOpenChange?.(false)}
          />
        </Suspense>
      </DialogContent>
    </Dialog>
  )
}
