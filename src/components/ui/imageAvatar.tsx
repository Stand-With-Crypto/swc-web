import { MaybeNextImgProps, NextImage } from '@/components/ui/image'
import { cn } from '@/utils/web/cn'

export type ImageAvatarProps = { size: number; className?: string } & Omit<
  MaybeNextImgProps,
  'width' | 'height'
>

export const ImageAvatar: React.FC<ImageAvatarProps> = ({ size, className, ...props }) => {
  return (
    <span className="relative inline-block" style={{ width: size, height: size }}>
      <NextImage
        fill
        style={{ objectFit: 'cover' }}
        className={cn('inline-block rounded-full', className)}
        sizes={`${size}px`}
        {...props}
      />
    </span>
  )
}
ImageAvatar.displayName = 'ImageAvatar'
