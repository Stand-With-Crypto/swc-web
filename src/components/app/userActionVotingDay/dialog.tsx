'use client'

import { Suspense } from 'react'

import { UserActionFormDialog } from '@/components/app/userActionFormCommon/dialog'
import { ANALYTICS_NAME_USER_ACTION_VOTING_DAY } from '@/components/app/userActionVotingDay/constants'
import { LazyUserActionVotingDay } from '@/components/app/userActionVotingDay/lazyLoad'
import { UserActionDayVotingDaySkeleton } from '@/components/app/userActionVotingDay/skeleton'
import { useDialog } from '@/hooks/useDialog'

export function UserActionVotingDayDialog({
  children,
  defaultOpen = false,
  ...formProps
}: {
  children: React.ReactNode
  defaultOpen?: boolean
}) {
  const dialogProps = useDialog({
    initialOpen: defaultOpen,
    analytics: ANALYTICS_NAME_USER_ACTION_VOTING_DAY,
  })

  return (
    <UserActionFormDialog {...dialogProps} trigger={children}>
      <Suspense fallback={<UserActionDayVotingDaySkeleton />}>
        <LazyUserActionVotingDay {...formProps} onClose={() => dialogProps.onOpenChange(false)} />
      </Suspense>
    </UserActionFormDialog>
  )
}
