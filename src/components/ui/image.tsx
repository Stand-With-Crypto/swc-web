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

  const {
    src,
    width: _width,
    height: _height,
    layout: _layout,
    placeholder: _placeholder,
    blurDataURL: _blurDataURL,
    loader: _loader,
    quality: _quality,
    priority: _priority,
    loading: _loading,
    unoptimized: _unoptimized,
    objectFit: _objectFit,
    fill: _fill,
    objectPosition: _objectPosition,
    ...imgProps
  } = props

  // eslint-disable-next-line
  return <img {...{ ...imgProps, src: src as string }} />
}
