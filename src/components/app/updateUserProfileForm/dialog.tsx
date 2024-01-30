'use client'

import { UpdateUserProfileFormContainer } from '@/components/app/updateUserProfileForm'
import { LazyUpdateUserProfileForm } from '@/components/app/updateUserProfileForm/lazyLoad'
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { useDialog } from '@/hooks/useDialog'
import { Suspense } from 'react'

export function UpdateUserProfileFormDialog({
  children,
  defaultOpen = false,
  ...formProps
}: Omit<React.ComponentProps<typeof UpdateUserProfileFormContainer>, 'onCancel' | 'onSuccess'> & {
  children: React.ReactNode
  defaultOpen?: boolean
}) {
  const dialogProps = useDialog(defaultOpen)
  return (
    <Dialog {...dialogProps}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-md">
        <Suspense fallback={<Skeleton className="h-80 w-full" />}>
          <LazyUpdateUserProfileForm
            {...formProps}
            onCancel={() => dialogProps.onOpenChange(false)}
            onSuccess={() => dialogProps.onOpenChange(false)}
          />
        </Suspense>
      </DialogContent>
    </Dialog>
  )
}
