import * as Sentry from '@sentry/nextjs'

import { ImageAvatar, ImageAvatarProps } from '@/components/ui/imageAvatar'
import { InitialsAvatar } from '@/components/ui/initialsAvatar'
import { DTSI_Person } from '@/data/dtsi/generated'
import { dtsiPersonFullName } from '@/utils/dtsi/dtsiPersonUtils'

export interface DTSIAvatarProps extends Pick<ImageAvatarProps, 'size' | 'className'> {
  person: Pick<
    DTSI_Person,
    | 'firstName'
    | 'lastName'
    | 'firstNickname'
    | 'nameSuffix'
    | 'profilePictureUrl'
    | 'profilePictureUrlDimensions'
  >
}

export const DTSIAvatar: React.FC<DTSIAvatarProps> = ({ person, ...props }) => {
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
  // https://stand-with-crypto.sentry.io/issues/5012094116/?environment=production&project=4506490717470720&query=is%3Aunresolved+timesSeen%3A%3E%3D10&referrer=issue-stream&statsPeriod=30d&stream_index=17
  // this should never happen, adding additional debug info to figure out whats going on
  if (!person.firstNickname && !person.firstName) {
    Sentry.captureMessage('DTSIAvatar: Found person without first name', { extra: { person } })
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
