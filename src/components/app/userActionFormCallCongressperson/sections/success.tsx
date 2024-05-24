import { UserActionFormSuccessScreenFeedback } from '@/components/app/userActionFormSuccessScreen/UserActionFormSuccessScreenFeedback'
import { NextImage } from '@/components/ui/image'
import { Video } from '@/components/ui/video'

const ImageFallback = (
  <NextImage
    alt="A phone with the text 'I CALLED CONGRESS FOR CRYPTO' displayed on its screen."
    fill
    src="/actionTypeVideos/swca_call_still_4k.png"
  />
)

export const UserActionFormCallCongresspersonSuccess = () => {
  return (
    <UserActionFormSuccessScreenFeedback
      Image={
        <div className="relative h-[245px] w-[300px] overflow-hidden rounded-xl sm:w-[345px]">
          <Video
            className={'absolute left-0 top-0 h-full w-full object-cover'}
            fallback={ImageFallback}
            src="/actionTypeVideos/swca_call.mp4"
          />
        </div>
      }
      subtitle="... and got a free NFT for doing so!"
      title="You called your senator!"
    />
  )
}
