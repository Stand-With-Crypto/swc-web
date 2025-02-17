import { USER_ACTION_FORM_SUCCESS_SCREEN_INFO } from '@/components/app/userActionFormSuccessScreen/constants'
import { UserActionFormSuccessScreenFeedback } from '@/components/app/userActionFormSuccessScreen/UserActionFormSuccessScreenFeedback'
import { VideoPlayer } from '@/components/ui/video'
import { NextImage } from '@/components/ui/image'

export const UserActionFormJoinSWCSuccess = () => {
  const imageFallback = (
    <NextImage
      alt="A animated SWC Shield."
      height={245}
      sizes="(max-width: 640px) 300px, 345px"
      src="/actionTypeVideos/swca_join_still.png"
      width={300}
    />
  )

  return (
    <UserActionFormSuccessScreenFeedback
      image={
        <VideoPlayer
          type="video"
          url="/actionTypeVideos/swca_join.mp4"
          height={300}
          width={300}
          fallback={imageFallback}
          className="overflow-hidden rounded-xl sm:w-[345px]"
          fit="cover"
          autoplay
          muted
          loop
        />
      }
      {...USER_ACTION_FORM_SUCCESS_SCREEN_INFO.OPT_IN}
    />
  )
}
