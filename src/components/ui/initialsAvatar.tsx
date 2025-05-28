import { cn } from '@/utils/web/cn'

interface InitialsAvatarProps {
  size: number
  className?: string
  firstInitial: string
  lastInitial?: string
}

const getFontSize = (size: number) => {
  if (size < 20) {
    return cn('text-sm')
  }
  if (size < 30) {
    return cn('text-base')
  }
  if (size < 100) {
    return cn('text-lg')
  }
  return cn('text-4xl')
}

export const InitialsAvatar: React.FC<InitialsAvatarProps> = ({ size, className, ...props }) => {
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
InitialsAvatar.displayName = 'InitialsAvatar'
