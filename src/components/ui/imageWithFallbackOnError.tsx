'use client'

import { DetailedHTMLProps, ImgHTMLAttributes, useState } from 'react'

import { MaybeNextImg } from '@/components/ui/image'

export function ImageWithFallbackOnError({
  src,
  alt,
  fallbackSrc,
  width,
  height,
  ...props
}: DetailedHTMLProps<ImgHTMLAttributes<HTMLImageElement>, HTMLImageElement> & {
  alt: string
  src: string
  fallbackSrc: string
  width?: number
  height?: number
}) {
  const [hasErrored, setHasErrored] = useState(false)

  return (
    <MaybeNextImg
      {...props}
      alt={alt}
      height={height}
      onError={() => setHasErrored(true)}
      src={hasErrored ? fallbackSrc : src}
      width={width}
    />
  )
}
