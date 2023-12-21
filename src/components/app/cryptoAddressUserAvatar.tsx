import { ClientCryptoAddressUser } from '@/clientModels/clientCryptoAddress/clientCryptoAddressUser'
import { NextImage } from '@/components/ui/image'
import { ImageAvatar, ImageAvatarProps } from '@/components/ui/imageAvatar'
import { InitialsAvatar } from '@/components/ui/initialsAvatar'

import { dtsiPersonFullName } from '@/utils/dtsi/dtsiPersonUtils'
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
export const CryptoAddressUserAvatar: React.FC<
  {
    cryptoAddressUser: Pick<ClientCryptoAddressUser, 'cryptoAddress'> | null
  } & Pick<ImageAvatarProps, 'size' | 'className'>
> = ({ cryptoAddressUser, size, ...props }) => {
  if (!cryptoAddressUser?.cryptoAddress) {
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
      src={deterministicArraySelection(genericImages, cryptoAddressUser.cryptoAddress)}
      alt="Generic profile picture for anonymous user"
      width={size}
      height={size}
    />
  )
}
