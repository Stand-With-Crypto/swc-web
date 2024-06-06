'use client'

import dynamic from 'next/dynamic'

import { UserActionFormSuccessScreenFeedback } from '@/components/app/userActionFormSuccessScreen/UserActionFormSuccessScreenFeedback'
import { UserActionFormSuccessScreenNextActionSkeleton } from '@/components/app/userActionFormSuccessScreen/userActionFormSuccessScreenNextAction'
import { Dialog, DialogContent, DialogProps } from '@/components/ui/dialog'
import { dialogContentPaddingStyles } from '@/components/ui/dialog/styles'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useApiResponseForUserPerformedUserActionTypes } from '@/hooks/useApiResponseForUserPerformedUserActionTypes'
import { useSession } from '@/hooks/useSession'
import { cn } from '@/utils/web/cn'

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
      <DialogContent className="max-w-3xl ">
        <ScrollArea
          className={cn(
            dialogContentPaddingStyles,
            '-mx-6 -mb-6 overflow-auto max-md:-mt-20 md:-mt-14 lg:max-h-[75vh]',
          )}
        >
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
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
