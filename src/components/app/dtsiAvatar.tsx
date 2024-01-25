import { ImageAvatar, ImageAvatarProps } from '@/components/ui/imageAvatar'
import { InitialsAvatar } from '@/components/ui/initialsAvatar'

import { DTSI_Person } from '@/data/dtsi/generated'
import { dtsiPersonFullName } from '@/utils/dtsi/dtsiPersonUtils'

export function DTSIAvatar({
  person,
  ...props
}: {
  person: Pick<
    DTSI_Person,
    | 'firstName'
    | 'lastName'
    | 'firstNickname'
    | 'nameSuffix'
    | 'profilePictureUrl'
    | 'profilePictureUrlDimensions'
  >
} & Pick<ImageAvatarProps, 'size' | 'className'>) {
  if (person.profilePictureUrl) {
    return (
      <ImageAvatar
        className="rounded-md"
        alt={`Profile picture of ${dtsiPersonFullName(person)}`}
        src={person.profilePictureUrl}
        {...props}
      />
    )
  }
  return (
    <InitialsAvatar
      className="rounded-md"
      firstInitial={(person.firstNickname || person.firstName).slice(0, 1)}
      lastInitial={person.lastName.slice(0, 1)}
      {...props}
    />
  )
}
