'use client'

import { Suspense } from 'react'

import { UserActionFormDialog } from '@/components/app/userActionFormCommon/dialog'
import { UserActionFormVoterRegistration } from '@/components/app/userActionFormVoterRegistration'
import { ANALYTICS_NAME_USER_ACTION_FORM_VOTER_REGISTRATION } from '@/components/app/userActionFormVoterRegistration/constants'
import { LazyUserActionFormVoterRegistration } from '@/components/app/userActionFormVoterRegistration/lazyLoad'
import { UserActionFormVoterRegistrationSkeleton } from '@/components/app/userActionFormVoterRegistration/skeleton'
import { useDialog } from '@/hooks/useDialog'

export function UserActionFormVoterRegistrationDialog({
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
    <UserActionFormDialog {...dialogProps} trigger={children}>
      <Suspense fallback={<UserActionFormVoterRegistrationSkeleton />}>
        <LazyUserActionFormVoterRegistration
          {...formProps}
          onClose={() => dialogProps.onOpenChange(false)}
        />
      </Suspense>
    </UserActionFormDialog>
  )
}
