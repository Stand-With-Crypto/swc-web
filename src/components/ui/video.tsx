import { ReactNode, VideoHTMLAttributes } from 'react'

interface VideoProps extends VideoHTMLAttributes<HTMLVideoElement> {
  /**
   * Fallback content to display if the browser does not support the video tag.
   */
  fallback?: ReactNode
  className?: string
}

/**
 * `Video` is a component that renders a video element with the specified source and fallback content.
 */
export function Video(props: VideoProps) {
  const { src, className, fallback, ...rest } = props

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
      <source src={src} type="video/mp4" />

      {fallback || <p>Your browser does not support the video tag.</p>}
    </video>
  )
}
