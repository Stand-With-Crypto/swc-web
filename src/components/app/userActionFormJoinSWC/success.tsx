'use client'

import { USER_ACTION_FORM_SUCCESS_SCREEN_INFO } from '@/components/app/userActionFormSuccessScreen/constants'
import { UserActionFormSuccessScreenFeedback } from '@/components/app/userActionFormSuccessScreen/UserActionFormSuccessScreenFeedback'
import {
  UserActionFormSuccessScreenNextAction,
  UserActionFormSuccessScreenNextActionSkeleton,
} from '@/components/app/userActionFormSuccessScreen/userActionFormSuccessScreenNextAction'
import { Dialog, DialogContent, DialogProps } from '@/components/ui/dialog'
import { NextImage } from '@/components/ui/image'
import { Video } from '@/components/ui/video'
import { useApiResponseForUserPerformedUserActionTypes } from '@/hooks/useApiResponseForUserPerformedUserActionTypes'
import { useSession } from '@/hooks/useSession'

const imageFallback = (
  <NextImage alt="A animated SWC Shield." fill src="/actionTypeVideos/swca_join_still.png" />
)

export const UserActionFormJoinSWCSuccess = () => {
  return (
    <UserActionFormSuccessScreenFeedback
      Image={
        <div className="relative h-[245px] w-[300px] overflow-hidden rounded-xl sm:w-[345px]">
          <Video
            className={'absolute left-0 top-0 h-full w-full object-cover'}
            fallback={imageFallback}
            src="/actionTypeVideos/swca_join.mp4"
          />
        </div>
      }
      {...USER_ACTION_FORM_SUCCESS_SCREEN_INFO.OPT_IN}
    />
  )
}

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
