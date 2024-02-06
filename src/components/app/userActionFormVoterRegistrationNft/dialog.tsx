'use client'

import { UserActionFormVoterRegistrationNft } from '@/components/app/userActionFormVoterRegistrationNft'
import { ANALYTICS_NAME_USER_ACTION_FORM_VOTER_REGISTRATION_NFT } from '@/components/app/userActionFormVoterRegistrationNft/constants'
import { LazyUserActionFormVoterRegistrationNft } from '@/components/app/userActionFormVoterRegistrationNft/lazyLoad'
import { UserActionFormVoterRegistrationNftSkeleton } from '@/components/app/userActionFormVoterRegistrationNft/skeleton'
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'
import { useDialog } from '@/hooks/useDialog'
import { Suspense } from 'react'

export function UserActionFormVoterRegistrationNftDialog({
  children,
  defaultOpen = false,
  ...formProps
}: Omit<React.ComponentProps<typeof UserActionFormVoterRegistrationNft>, 'onClose'> & {
  children: React.ReactNode
  defaultOpen?: boolean
}) {
  const dialogProps = useDialog({
    initialOpen: defaultOpen,
    analytics: ANALYTICS_NAME_USER_ACTION_FORM_VOTER_REGISTRATION_NFT,
  })

  return (
    <Dialog {...dialogProps}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-3xl">
        <Suspense fallback={<UserActionFormVoterRegistrationNftSkeleton />}>
          <LazyUserActionFormVoterRegistrationNft
            {...formProps}
            onClose={() => dialogProps.onOpenChange(false)}
          />
        </Suspense>
      </DialogContent>
    </Dialog>
  )
}
