import React from 'react'

import { MaybeNextImg } from '@/components/ui/image'
import { InitialsAvatar } from '@/components/ui/initialsAvatar'
import { DTSIPersonDetails } from '@/data/dtsi/queries/queryDTSIPersonDetails'
import { dtsiPersonFullName } from '@/utils/dtsi/dtsiPersonUtils'
import { cn } from '@/utils/web/cn'

export interface ProfileAvatarProps {
  size: number
  className?: string
  person: Pick<
    DTSIPersonDetails,
    'profilePictureUrl' | 'firstName' | 'firstNickname' | 'lastName' | 'nameSuffix'
  >
  alt?: string
}

export const ProfileAvatar: React.FC<ProfileAvatarProps> = ({ size, className, person, alt }) => {
  const displayName = alt || `profile picture of ${dtsiPersonFullName(person)}`

  return (
    <div
      className={cn('box-sizing-border overflow-hidden rounded-full', className)}
      style={{ width: size, height: size }}
    >
      {person.profilePictureUrl ? (
        <MaybeNextImg
          alt={displayName}
          className="w-full"
          sizes={`${size}px`}
          src={person.profilePictureUrl}
        />
      ) : (
        <InitialsAvatar
          firstInitial={(person.firstNickname || person.firstName).slice(0, 1)}
          lastInitial={person.lastName.slice(0, 1)}
          size={size}
        />
      )}
    </div>
  )
}

ProfileAvatar.displayName = 'ProfileAvatar'
