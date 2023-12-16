import { MaybeNextImgProps, NextImage } from '@/components/ui/image'
import { cn } from '@/utils/web/cn'

export type AvatarBaseProps = {
  size: number
  className?: string
}

export type AvatarProps = (
  | Omit<MaybeNextImgProps, 'width' | 'height'>
  | { firstInitial: string; lastInitial?: string }
) &
  AvatarBaseProps

const getFontSize = (size: number) => {
  if (size < 20) {
    return cn('text-sm')
  }
  if (size < 30) {
    return cn('text-base')
  }
  return cn('text-lg')
}

export const Avatar: React.FC<AvatarProps> = ({ size, className, ...props }) => {
  if ('src' in props) {
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
  return (
    <span
      className={cn('inline-flex items-center justify-center rounded-full bg-gray-800', className)}
      style={{ width: size, height: size }}
    >
      <span className={cn('font-medium leading-none text-white', getFontSize(size))}>
        {props.firstInitial}
        {props.lastInitial}
      </span>
    </span>
  )
}
Avatar.displayName = 'Avatar'
