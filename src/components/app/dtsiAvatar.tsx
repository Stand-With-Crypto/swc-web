import { Avatar, AvatarBaseProps } from '@/components/ui/avatar'
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
  } & AvatarBaseProps
> = ({ person, ...props }) => {
  return (
    <Avatar
      {...props}
      {...(person.profilePictureUrl
        ? {
            alt: `Profile picture of ${dtsiPersonFullName(person)}`,
            src: person.profilePictureUrl,
          }
        : { firstInitial: person.firstName.slice(0, 1), lastInitial: person.lastName.slice(0, 1) })}
    />
  )
}
