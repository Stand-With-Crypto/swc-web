import { NextImage } from '@/components/ui/image'
import { Video } from '@/components/ui/video'

export function DidYouVoteVideo() {
  const imageFallback = (
    <NextImage
      alt="Did you vote?"
      fill
      sizes="(max-width: 345px) 100vw, 50vw"
      src="/actionTypeIcons/iVoted.png"
      style={{ objectFit: 'cover' }}
    />
  )

  return (
    <Video
      className={'h-[250px] w-[345px] overflow-hidden rounded-xl object-cover'}
      fallback={imageFallback}
      src="/actionTypeVideos/iVoted.mp4"
    />
  )
}
