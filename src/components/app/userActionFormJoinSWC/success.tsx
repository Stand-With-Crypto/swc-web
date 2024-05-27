'use client'

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

const ImageFallback = (
  <NextImage alt="A animated SWC Shield." fill src="/actionTypeVideos/swca_join_still_4k.png" />
)

export const UserActionFormJoinSWCSuccess = () => {
  return (
    <UserActionFormSuccessScreenFeedback
      Image={
        <div className="relative h-[245px] w-[300px] overflow-hidden rounded-xl sm:w-[345px]">
          <Video
            className={'absolute left-0 top-0 h-full w-full object-cover'}
            fallback={ImageFallback}
            src="/actionTypeVideos/swca_join.mp4"
          />
        </div>
      }
      subtitle="... and got a free NFT for doing so!"
      title="You joined Stand With Crypto!"
    />
  )
}

export const ANALYTICS_NAME_USER_ACTION_FORM_JOIN_SWC = 'User Action Form Join SWC'

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
      <DialogContent className="max-w-3xl">
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
