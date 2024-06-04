'use client'

import dynamic from 'next/dynamic'

import { UserActionFormSuccessScreenNextActionSkeleton } from '@/components/app/userActionFormSuccessScreen/userActionFormSuccessScreenNextAction'
import { Dialog, DialogContent, DialogProps } from '@/components/ui/dialog'
import { LoadingOverlay } from '@/components/ui/loadingOverlay'
import { Portal } from '@/components/ui/portal'
import { useApiResponseForUserPerformedUserActionTypes } from '@/hooks/useApiResponseForUserPerformedUserActionTypes'
import { useSession } from '@/hooks/useSession'

const UserActionFormJoinSWCSuccess = dynamic(
  () =>
    import('@/components/app/userActionFormJoinSWC/success').then(
      module => module.UserActionFormJoinSWCSuccess,
    ),
  {
    loading: () => (
      <Portal>
        <div className="min-h-[400px]">
          <LoadingOverlay />
        </div>
      </Portal>
    ),
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

export interface UserActionFormJoinSWCSuccessDialogProps extends DialogProps {}

export function UserActionFormJoinSWCSuccessDialog(props: UserActionFormJoinSWCSuccessDialogProps) {
  const { ...dialogProps } = props

  const session = useSession()
  const performedUserActionTypesResponse = useApiResponseForUserPerformedUserActionTypes()

  const performedUserActionTypes =
    performedUserActionTypesResponse.data?.performedUserActionTypes?.map(
      action => action.actionType,
    )

  return (
    <Dialog {...dialogProps}>
      <DialogContent className="max-w-3xl space-y-6">
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
      </DialogContent>
    </Dialog>
  )
}
