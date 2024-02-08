'use client'

import { UserActionFormVoterRegistration } from '@/components/app/userActionFormVoterRegistration'
import { ANALYTICS_NAME_USER_ACTION_FORM_VOTER_REGISTRATION } from '@/components/app/userActionFormVoterRegistration/constants'
import { LazyUserActionFormVoterRegistration } from '@/components/app/userActionFormVoterRegistration/lazyLoad'
import { UserActionFormVoterRegistrationSkeleton } from '@/components/app/userActionFormVoterRegistration/skeleton'
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'
import { useDialog } from '@/hooks/useDialog'
import { Suspense, memo } from 'react'

export const UserActionFormVoterRegistrationDialog = memo(
  function UserActionFormVoterRegistrationDialog({
    children,
    defaultOpen = false,
    ...formProps
  }: Omit<React.ComponentProps<typeof UserActionFormVoterRegistration>, 'onClose'> & {
    children: React.ReactNode
    defaultOpen?: boolean
  }) {
    const dialogProps = useDialog({
      initialOpen: defaultOpen,
      analytics: ANALYTICS_NAME_USER_ACTION_FORM_VOTER_REGISTRATION,
    })

    return (
      <Dialog {...dialogProps}>
        <DialogTrigger asChild>{children}</DialogTrigger>
        <DialogContent className="max-w-3xl">
          <Suspense fallback={<UserActionFormVoterRegistrationSkeleton />}>
            <LazyUserActionFormVoterRegistration
              {...formProps}
              onClose={() => dialogProps.onOpenChange(false)}
            />
          </Suspense>
        </DialogContent>
      </Dialog>
    )
  },
)
