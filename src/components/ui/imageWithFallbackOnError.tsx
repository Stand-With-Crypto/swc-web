'use client'

import React from 'react'

export function ImageWithFallbackOnError({
  src,
  alt,
  fallbackSrc,
  ...props
}: React.DetailedHTMLProps<React.ImgHTMLAttributes<HTMLImageElement>, HTMLImageElement> & {
  alt: string
  src: string
  fallbackSrc: string
}) {
  const [hasErrored, setHasErrored] = React.useState(false)
  return (
    /* eslint-disable-next-line @next/next/no-img-element */
    <img
      {...props}
      alt={alt}
      onError={() => setHasErrored(true)}
      src={hasErrored ? fallbackSrc : src}
    />
  )
}
