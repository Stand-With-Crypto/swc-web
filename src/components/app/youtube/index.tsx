'use client'

// https://github.com/cookpete/react-player/issues/1428
// Lazy load the ReactPlayer component to avoid hydration issues
const ReactPlayer = dynamic(() => import('react-player/lazy'), { ssr: false })

import { cn } from '@/utils/web/cn'
import dynamic from 'next/dynamic'

interface Props {
  videoId: string
  aspectRatio?: number
  /** The time in seconds at which the video should start playing */
  start?: number
  style?: React.CSSProperties
  className?: string
  allowFullScreen?: boolean
  /** Default is `false` */
  controls?: boolean
  loop?: boolean
  muted?: boolean
  /** Requires muted to be `true` to work */
  autoplay?: boolean
  /** Allows video to play inline on iOS. Default is `false` */
  playsinline?: boolean
  /** `undefined` uses default volume on all players  */
  volume?: number
}

// It is recommended to use the default aspect ratio of 16/9
// To calculate the aspect ratio, divide the height by the width
export const DEFAULT_ASPECT_RATIO = 9 / 16

export function YouTube({
  aspectRatio = DEFAULT_ASPECT_RATIO,
  start,
  allowFullScreen,
  style,
  className,
  autoplay,
  videoId,
  ...props
}: Props) {
  // Using nocookie player to reduce the amount of console warnings
  // https://github.com/cookpete/react-player/issues/1869
  const url = `https://www.youtube-nocookie.com/embed/${videoId}`

  return (
    <div
      className={cn('w-full', className)}
      style={{
        ...style,
        aspectRatio,
      }}
    >
      <ReactPlayer
        config={{
          youtube: {
            playerVars: {
              // https://developers.google.com/youtube/player_parameters
              start: String(start),
              iv_load_policy: '3', // Hide video annotations
              fs: allowFullScreen ? '1' : '0',
            },
          },
        }}
        height="100%"
        playing={autoplay}
        width="100%"
        url={url}
        {...props}
      />
    </div>
  )
}
