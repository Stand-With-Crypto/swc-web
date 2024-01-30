'use client'

import { UpdateUserProfileFormContainer } from '@/components/app/updateUserProfileForm'
import { LazyUpdateUserProfileForm } from '@/components/app/updateUserProfileForm/lazyLoad'
import { OPEN_UPDATE_USER_PROFILE_FORM_QUERY_PARAM_KEY } from '@/components/app/updateUserProfileForm/queryParamConfig'
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { useQueryParamDialog } from '@/hooks/useQueryParamDialog'
import { Suspense } from 'react'

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
    <Dialog {...dialogProps}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-xl">
        <Suspense fallback={<Skeleton className="h-80 w-full" />}>
          <LazyUpdateUserProfileForm
            {...formProps}
            onCancel={() => dialogProps.onOpenChange?.(false)}
            onSuccess={() => dialogProps.onOpenChange?.(false)}
          />
        </Suspense>
      </DialogContent>
    </Dialog>
  )
}
