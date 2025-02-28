import { USER_ACTION_FORM_SUCCESS_SCREEN_INFO } from '@/components/app/userActionFormSuccessScreen/constants'
import { UserActionFormSuccessScreenFeedback } from '@/components/app/userActionFormSuccessScreen/UserActionFormSuccessScreenFeedback'
import { NextImage } from '@/components/ui/image'
import { VideoPlayer } from '@/components/ui/video'

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
          autoplay
          className="overflow-hidden rounded-xl sm:w-[345px]"
          failFallback={imageFallback}
          fit="cover"
          height={300}
          loadingFallback={
            <NextImage
              alt="loading"
              className="h-full w-full object-cover"
              fill
              priority
              src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mOM8FqyAgAEOAHwiAoWHAAAAABJRU5ErkJggg=="
            />
          }
          loop
          muted
          type="video"
          url="/actionTypeVideos/swca_join.mp4"
          width={300}
        />
      }
      {...USER_ACTION_FORM_SUCCESS_SCREEN_INFO.OPT_IN}
    />
  )
}
