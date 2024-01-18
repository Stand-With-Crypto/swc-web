import { omit } from 'lodash'
import NextImageComponent, { ImageProps as NextImageProps } from 'next/image'

export const NextImage = NextImageComponent

export type MaybeNextImgProps = Omit<NextImageProps, 'width' | 'height'> & {
  width?: number
  height?: number
}

export const MaybeNextImg: React.FC<MaybeNextImgProps> = props => {
  if (props.width && props.height) {
    return <NextImage {...(props as NextImageProps)} />
  }

  const { src, ...imgProps } = omit(props, [
    'width',
    'height',
    'layout',
    'placeholder',
    'blurDataURL',
    'loader',
    'quality',
    'priority',
    'loading',
    'unoptimized',
    'objectFit',
    'fill',
    'objectPosition',
  ])
  // eslint-disable-next-line
  return <img {...{ ...imgProps, src: src as string }} />
}
