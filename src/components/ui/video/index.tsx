'use client'

import * as Sentry from '@sentry/nextjs'

// https://github.com/cookpete/react-player/issues/1428
// Lazy load the ReactPlayer component to avoid hydration issues
const ReactPlayer = dynamic(() => import('react-player/lazy'), { ssr: false })

import { useState } from 'react'

import { cn } from '@/utils/web/cn'
import dynamic from 'next/dynamic'

export const supportedVideoTypes = ['youtube', 'video'] as const

export type SupportedVideoTypes = (typeof supportedVideoTypes)[number]

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
  /** Allows video to play inline on iOS. Default is `false` */
  playsinline?: boolean
  /** `undefined` uses default volume on all players  */
  volume?: number
  /** Fallback component to show if the video fails to load */
  fallback?: React.ReactNode
  /** Fallback component to show while the video is loading */
  loadingFallback?: React.ReactNode
  fit?: 'cover' | 'contain' | 'fill'
  height?: string | number
  width?: string | number
}

type VideoProps = (YoutubePlayerType | VideoPlayerType) & CommonProps

// Its recommended to use the default aspect ratio of 16/9
// To calculate the aspect ratio, divide the height by the width
export const DEFAULT_ASPECT_RATIO = 9 / 16

export function VideoPlayer(props: VideoProps) {
  const [error, setError] = useState(false)

  const {
    aspectRatio = DEFAULT_ASPECT_RATIO,
    start,
    allowFullScreen,
    style,
    className,
    autoplay,
    type,
    previewImage,
    fallback,
    loadingFallback,
    fit,
    height = '100%',
    width = '100%',
    controls,
    loop,
    muted,
    playsinline,
    volume,
  } = props

  let url: string | undefined
  if (type === 'youtube') {
    // Using nocookie player to reduce the amount of console warnings
    // https://github.com/cookpete/react-player/issues/1869
    url = `https://www.youtube-nocookie.com/embed/${props.videoId}`
  } else if (type === 'video') {
    url = props.url
  } else {
    Sentry.captureMessage(`Unsupported player type`, {
      extra: {
        props,
      },
      tags: {
        domain: 'builder.io',
      },
    })
  }

  if (!url || error) {
    return fallback || null
  }

  return (
    <ReactPlayer
      className={cn(className, {
        '[&>*]:object-cover': fit === 'cover',
        '[&>*]:object-contain': fit === 'contain',
        '[&>*]:object-fill': fit === 'fill',
      })}
      style={{
        ...style,
        aspectRatio,
      }}
      height={height}
      width={width}
      onError={() => setError(true)}
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
      light={autoplay && props.muted ? undefined : previewImage}
      playing={autoplay}
      fallback={loadingFallback ? <>{loadingFallback}</> : undefined}
      url={url}
      controls={controls}
      loop={loop}
      muted={muted}
      playsinline={playsinline}
      volume={volume}
    />
  )
}
