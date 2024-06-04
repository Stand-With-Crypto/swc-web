'use client'

import { USER_ACTION_FORM_SUCCESS_SCREEN_INFO } from '@/components/app/userActionFormSuccessScreen/constants'
import { UserActionFormSuccessScreenFeedback } from '@/components/app/userActionFormSuccessScreen/UserActionFormSuccessScreenFeedback'
import { NextImage } from '@/components/ui/image'
import { Video } from '@/components/ui/video'

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
