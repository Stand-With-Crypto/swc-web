import React, { CSSProperties } from 'react'

import { MaybeNextImgProps, NextImage } from '@/components/ui/image'
import { DTSI_PublicUser } from '@/data/dtsi/generated'
import { cn, twNoop } from '@/utils/web/cn'

interface AvatarBaseProps {
  size: number
  className?: string
  style?: CSSProperties
}

export type AvatarProps = (
  | Omit<MaybeNextImgProps, 'width' | 'height'>
  | { firstInitial: string; lastInitial?: string }
) &
  AvatarBaseProps

function getFontSize(size: number) {
  if (size < 20) {
    return twNoop('text-sm')
  }
  if (size < 30) {
    return twNoop('text-base')
  }
  return twNoop('text-lg')
}

function Avatar({ size, className, style, ...props }: AvatarProps) {
  if ('src' in props) {
    return (
      <div className={cn('relative', className)} style={{ width: size, height: size, ...style }}>
        <NextImage
          className={cn('rounded-full')}
          fill
          sizes={`${size}px`}
          style={{ objectFit: 'cover' }}
          {...props}
        />
      </div>
    )
  }
  return (
    <div
      className={cn('flex items-center justify-center rounded-full bg-gray-500', className)}
      style={{ width: size, height: size, ...style }}
    >
      <span className={cn('font-medium leading-none text-white', getFontSize(size))}>
        {props.firstInitial}
        {props.lastInitial}
      </span>
    </div>
  )
}
Avatar.displayName = 'Avatar'

export function DTSIUserAvatar({ user, ...props }: { user: DTSI_PublicUser } & AvatarBaseProps) {
  const words = user.displayName.split(' ')
  const initials = [
    words[0].slice(0, 1),
    words.length > 1 ? words[words.length - 1].slice(0, 1) : undefined,
  ] as const
  return (
    <Avatar
      {...props}
      {...(user.profilePictureUrl
        ? {
            alt: `Profile picture of ${user.displayName}`,
            src: user.profilePictureUrl,
          }
        : {
            firstInitial: initials[0],
            lastInitial: initials[1],
          })}
    />
  )
}
