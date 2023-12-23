import { ClientUser } from '@/clientModels/clientUser/clientUser'
import { NextImage } from '@/components/ui/image'
import { ImageAvatarProps } from '@/components/ui/imageAvatar'

import { deterministicArraySelection } from '@/utils/shared/deterministicArraySelection'

const genericImages = [
  '/userAvatars/blue.svg',
  '/userAvatars/green.svg',
  '/userAvatars/orange.svg',
  '/userAvatars/purple.svg',
  '/userAvatars/red.svg',
  '/userAvatars/yellow.svg',
]

// TODO support ENS images
export const UserAvatar: React.FC<
  {
    user: ClientUser
  } & Pick<ImageAvatarProps, 'size' | 'className'>
> = ({ user, size, ...props }) => {
  if (!user.isPubliclyVisible || !user.cryptoAddress) {
    return (
      <NextImage
        {...props}
        src={'/userAvatars/grey.svg'}
        alt="Generic profile picture for anonymous user"
        width={size}
        height={size}
      />
    )
  }
  return (
    <NextImage
      {...props}
      src={deterministicArraySelection(genericImages, user.cryptoAddress.address)}
      alt="Generic profile picture for anonymous user"
      width={size}
      height={size}
    />
  )
}
