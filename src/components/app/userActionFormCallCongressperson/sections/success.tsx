import { USER_ACTION_FORM_SUCCESS_SCREEN_INFO } from '@/components/app/userActionFormSuccessScreen/constants'
import { UserActionFormSuccessScreenFeedback } from '@/components/app/userActionFormSuccessScreen/UserActionFormSuccessScreenFeedback'
import { NextImage } from '@/components/ui/image'
import { VideoPlayer } from '@/components/ui/video'

export const UserActionFormCallCongresspersonSuccess = () => {
  const ImageFallback = (
    <NextImage
      alt="A phone with the text 'I CALLED CONGRESS FOR CRYPTO' displayed on its screen."
      height={245}
      sizes="(max-width: 640px) 300px, 345px"
      src="/actionTypeVideos/swca_call_still.png"
      width={300}
    />
  )

  return (
    <UserActionFormSuccessScreenFeedback
      image={
        <VideoPlayer
          autoplay
          className="overflow-hidden rounded-xl sm:w-[345px]"
          fallback={ImageFallback}
          fit="cover"
          height={300}
          loop
          muted
          type="video"
          url="/actionTypeVideos/swca_call.mp4"
          width={300}
        />
      }
      {...USER_ACTION_FORM_SUCCESS_SCREEN_INFO.CALL}
    />
  )
}
