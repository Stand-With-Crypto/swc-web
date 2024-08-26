'use client'

import dynamic from 'next/dynamic'

import { UserActionFormSuccessScreenFeedback } from '@/components/app/userActionFormSuccessScreen/UserActionFormSuccessScreenFeedback'
import { UserActionFormSuccessScreenNextActionSkeleton } from '@/components/app/userActionFormSuccessScreen/userActionFormSuccessScreenNextAction'
import { Dialog, DialogContent, DialogProps } from '@/components/ui/dialog'
import { useApiResponseForUserPerformedUserActionTypes } from '@/hooks/useApiResponseForUserPerformedUserActionTypes'
import { useSession } from '@/hooks/useSession'

const UserActionFormJoinSWCSuccess = dynamic(
  () =>
    import('@/components/app/userActionFormJoinSWC/success').then(
      module => module.UserActionFormJoinSWCSuccess,
    ),
  {
    loading: () => <UserActionFormSuccessScreenFeedback.Skeleton />,
  },
)

const UserActionFormSuccessScreenNextAction = dynamic(
  () =>
    import(
      '@/components/app/userActionFormSuccessScreen/userActionFormSuccessScreenNextAction'
    ).then(module => module.UserActionFormSuccessScreenNextAction),
  {
    loading: () => <UserActionFormSuccessScreenNextActionSkeleton />,
  },
)

interface UserActionFormJoinSWCSuccessDialogProps extends DialogProps {}

export function UserActionFormJoinSWCSuccessDialog(props: UserActionFormJoinSWCSuccessDialogProps) {
  const { ...dialogProps } = props

  const session = useSession()
  const performedUserActionTypesResponse = useApiResponseForUserPerformedUserActionTypes()

  const performedUserActionTypes = performedUserActionTypesResponse.data?.performedUserActionTypes

  return (
    <Dialog {...dialogProps}>
      <DialogContent a11yTitle="Joined Stand With Crypto" className="max-w-3xl">
        <div className="space-y-6">
          <UserActionFormJoinSWCSuccess />

          {session.isLoading || !session.user || performedUserActionTypesResponse.isLoading ? (
            <UserActionFormSuccessScreenNextActionSkeleton />
          ) : (
            <UserActionFormSuccessScreenNextAction
              data={{
                userHasEmbeddedWallet: session.user.hasEmbeddedWallet,
                performedUserActionTypes: performedUserActionTypes || [],
              }}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
