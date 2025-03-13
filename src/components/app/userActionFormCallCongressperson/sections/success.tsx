import { USER_ACTION_FORM_SUCCESS_SCREEN_INFO } from '@/components/app/userActionFormSuccessScreen/constants'
import { UserActionFormSuccessScreenFeedback } from '@/components/app/userActionFormSuccessScreen/UserActionFormSuccessScreenFeedback'
import { NextImage } from '@/components/ui/image'
import { Video } from '@/components/ui/video'

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
        <Video
          className={'h-[245px] w-[300px] overflow-hidden rounded-xl object-cover sm:w-[345px]'}
          fallback={ImageFallback}
          src="/actionTypeVideos/swca_call.mp4"
        />
      }
      {...USER_ACTION_FORM_SUCCESS_SCREEN_INFO.CALL}
    />
  )
}
