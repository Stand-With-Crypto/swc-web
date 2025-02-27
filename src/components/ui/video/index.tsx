'use client'

import { useState } from 'react'
import ReactPlayer from 'react-player'
import * as Sentry from '@sentry/nextjs'

import { useHasHydrated } from '@/hooks/useHasHydrated'
import { cn } from '@/utils/web/cn'

export const supportedVideoFitTypes = ['cover', 'contain', 'fill'] as const

interface YoutubePlayerType {
  type: 'youtube'
  videoId: string
}

interface VideoPlayerType {
  type: 'video'
  url: string
}

export type PlayerType = YoutubePlayerType | VideoPlayerType

interface CommonProps {
  /** If `muted` and `autoplay` are true, this prop will be ignored */
  previewImage?: string
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
  /** Allows video to play inline on iOS. Default is `true` */
  playsinline?: boolean
  /** `undefined` uses default volume on all players  */
  volume?: number
  /** Fallback component to show if the video fails to load */
  failFallback?: React.ReactNode
  /** Fallback component to show while the video is loading or if the page has not yet hydrated */
  loadingFallback?: React.ReactNode
  fit?: (typeof supportedVideoFitTypes)[number]
  height?: string | number
  width?: string | number
}

type VideoProps = (YoutubePlayerType | VideoPlayerType) & CommonProps

// Its recommended to use the default aspect ratio of 16/9
// To calculate the aspect ratio, divide the height by the width
export const DEFAULT_ASPECT_RATIO = 9 / 16

export function VideoPlayer(props: VideoProps) {
  const [error, setError] = useState(false)
  const hasHydrated = useHasHydrated()

  const {
    aspectRatio = DEFAULT_ASPECT_RATIO,
    start,
    allowFullScreen,
    style,
    className,
    autoplay,
    type,
    previewImage,
    failFallback,
    loadingFallback,
    fit,
    height = '100%',
    width = '100%',
    controls,
    loop,
    muted,
    playsinline = true,
    volume,
  } = props

  const getUrl = () => {
    if (type === 'youtube') {
      // Using nocookie player to reduce the amount of console warnings
      // https://github.com/cookpete/react-player/issues/1869
      return `https://www.youtube-nocookie.com/embed/${props.videoId}`
    }

    if (type === 'video') {
      return props.url
    }

    Sentry.captureMessage(`Unsupported player type`, {
      extra: {
        props,
      },
      tags: {
        domain: 'builder.io',
      },
    })
  }

  const url = getUrl()

  if (!hasHydrated) {
    return loadingFallback
  }

  if (!url || error) {
    return failFallback || null
  }

  return (
    <ReactPlayer
      className={cn(className, {
        '[&>*]:object-cover': fit === 'cover',
        '[&>*]:object-contain': fit === 'contain',
        '[&>*]:object-fill': fit === 'fill',
      })}
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
      controls={controls}
      height={height}
      light={previewImage}
      loop={loop}
      muted={muted}
      onError={() => setError(true)}
      playing={autoplay}
      playsinline={playsinline}
      style={{
        ...style,
        aspectRatio,
      }}
      url={url}
      volume={volume}
      width={width}
    />
  )
}
