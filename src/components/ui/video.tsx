import { ReactNode, VideoHTMLAttributes } from 'react'
import { list } from '@vercel/blob'

interface VideoProps extends VideoHTMLAttributes<HTMLVideoElement> {
  fileName: string
  type?: string

  /**
   * Fallback content to display if the browser does not support the video tag.
   */
  fallback?: ReactNode
  className?: string
}

/**
 * `Video` is a component that fetches a video from the Vercel Blob Storage and renders it in a video tag.
 *
 * Needs to be wrapped in a `Suspense` component to handle loading states.
 */
export async function Video(props: VideoProps) {
  const { fileName, type = 'video/mp4', className, fallback, ...rest } = props

  const { blobs } = await list({
    prefix: fileName,
    limit: 1,
  })

  const url = blobs?.[0]?.url || '' // TODO: fallback to a media file

  return (
    <video
      aria-label="Media player"
      autoPlay
      className={className}
      height={400}
      loop
      muted
      playsInline
      poster="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkqAcAAIUAgUW0RjgAAAAASUVORK5CYII="
      preload="auto"
      {...rest}
    >
      <source src={url} type={type} />

      {fallback || <p>Your browser does not support the video tag.</p>}
    </video>
  )
}
