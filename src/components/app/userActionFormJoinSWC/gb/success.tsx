import { USER_ACTION_FORM_SUCCESS_SCREEN_INFO } from '@/components/app/userActionFormSuccessScreen/constants'
import { UserActionFormSuccessScreenFeedback } from '@/components/app/userActionFormSuccessScreen/UserActionFormSuccessScreenFeedback'
import { NextImage } from '@/components/ui/image'
import { Video } from '@/components/ui/video'

export const GBUserActionFormJoinSWCSuccess = () => {
  const imageFallback = (
    <NextImage
      alt="A SWC Shield."
      height={245}
      sizes="(max-width: 640px) 300px, 345px"
      src="/actionTypeVideos/join-intl-still.png"
      width={300}
    />
  )

  return (
    <UserActionFormSuccessScreenFeedback
      image={
        <Video
          className={'h-[300px] w-[300px] overflow-hidden rounded-xl object-cover sm:w-[345px]'}
          fallback={imageFallback}
          src="/actionTypeVideos/join_intl.mp4"
        />
      }
      {...USER_ACTION_FORM_SUCCESS_SCREEN_INFO.OPT_IN}
    />
  )
}
