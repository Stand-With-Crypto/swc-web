import { MaybeNextImgProps, NextImage } from '@/components/ui/image'
import { cn } from '@/utils/web/cn'

export type ImageAvatarProps = { size: number; className?: string } & Omit<
  MaybeNextImgProps,
  'width' | 'height'
>

export const ImageAvatar: React.FC<ImageAvatarProps> = ({ size, className, ...props }) => {
  return (
    <span className="relative inline-block" style={{ height: size, width: size }}>
      <NextImage
        className={cn('inline-block rounded-full', className)}
        fill
        sizes={`${size}px`}
        style={{ objectFit: 'cover' }}
        {...props}
      />
    </span>
  )
}
ImageAvatar.displayName = 'ImageAvatar'
