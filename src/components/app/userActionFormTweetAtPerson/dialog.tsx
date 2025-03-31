'use client'

import { Suspense } from 'react'

import { ANALYTICS_NAME_USER_ACTION_FORM_CALL_CONGRESSPERSON } from '@/components/app/userActionFormCallCongressperson/constants'
import { UserActionFormDialog } from '@/components/app/userActionFormCommon/dialog'
import { UserActionFormTweetAtPerson } from '@/components/app/userActionFormTweetAtPerson'
import { LazyUserActionFormTweetAtPerson } from '@/components/app/userActionFormTweetAtPerson/lazyLoad'
import { UserActionFormTweetAtPersonSkeleton } from '@/components/app/userActionFormTweetAtPerson/skeletons/dialogSkeleton'
import { useDialog } from '@/hooks/useDialog'
import { USUserActionTweetAtPersonCampaignName } from '@/utils/shared/userActionCampaigns/us/usUserActionCampaigns'

export function UserActionFormTweetAtPersonDialog({
  children,
  defaultOpen = false,
  ...formProps
}: Omit<React.ComponentProps<typeof UserActionFormTweetAtPerson>, 'slug'> & {
  children: React.ReactNode
  defaultOpen?: boolean
}) {
  const dialogProps = useDialog({
    initialOpen: defaultOpen,
    analytics: ANALYTICS_NAME_USER_ACTION_FORM_CALL_CONGRESSPERSON,
  })

  return (
    <UserActionFormDialog {...dialogProps} trigger={children}>
      <Suspense fallback={<UserActionFormTweetAtPersonSkeleton />}>
        <LazyUserActionFormTweetAtPerson
          {...formProps}
          slug={USUserActionTweetAtPersonCampaignName['2024_05_22_PIZZA_DAY']}
        />
      </Suspense>
    </UserActionFormDialog>
  )
}
