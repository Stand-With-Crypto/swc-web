import { ImageAvatar, ImageAvatarProps } from '@/components/ui/imageAvatar'
import { InitialsAvatar } from '@/components/ui/initialsAvatar'

import { DTSI_Person } from '@/data/dtsi/generated'
import { dtsiPersonFullName } from '@/utils/dtsi/dtsiPersonUtils'

export const DTSIAvatar: React.FC<
  {
    person: Pick<
      DTSI_Person,
      | 'firstName'
      | 'lastName'
      | 'firstNickname'
      | 'nameSuffix'
      | 'profilePictureUrl'
      | 'profilePictureUrlDimensions'
    >
  } & Pick<ImageAvatarProps, 'size' | 'className'>
> = ({ person, ...props }) => {
  if (person.profilePictureUrl) {
    return (
      <ImageAvatar
        alt={`Profile picture of ${dtsiPersonFullName(person)}`}
        className="rounded-md"
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
