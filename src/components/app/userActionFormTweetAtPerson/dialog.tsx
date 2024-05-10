'use client'

import { Suspense } from 'react'

import { ANALYTICS_NAME_USER_ACTION_FORM_CALL_CONGRESSPERSON } from '@/components/app/userActionFormCallCongressperson/constants'
import { UserActionFormTweetAtPerson } from '@/components/app/userActionFormTweetAtPerson'
import { LazyUserActionFormTweetAtPerson } from '@/components/app/userActionFormTweetAtPerson/lazyLoad'
import { UserActionFormTweetAtPersonSkeleton } from '@/components/app/userActionFormTweetAtPerson/skeletons/dialogSkeleton'
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'
import { useDialog } from '@/hooks/useDialog'
import { UserActionTweetAtPersonCampaignName } from '@/utils/shared/userActionCampaigns'

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
    <Dialog {...dialogProps}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-3xl">
        <Suspense fallback={<UserActionFormTweetAtPersonSkeleton />}>
          <LazyUserActionFormTweetAtPerson
            {...formProps}
            slug={UserActionTweetAtPersonCampaignName['2024_05_22_PIZZA_DAY']}
          />
        </Suspense>
      </DialogContent>
    </Dialog>
  )
}
