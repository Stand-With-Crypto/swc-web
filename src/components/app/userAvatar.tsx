import { ClientUserWithENSData } from '@/clientModels/clientUser/clientUser'
import { SensitiveDataClientUserWithENSData } from '@/clientModels/clientUser/sensitiveDataClientUser'
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

const Container = ({ children }: { children: React.ReactNode }) => (
  <div className="overflow-hidden rounded-full">{children}</div>
)

function DefaultUserAvatar({ size, ...props }: Pick<ImageAvatarProps, 'size' | 'className'>) {
  return (
    <Container>
      <NextImage
        {...props}
        src={'/userAvatars/grey.svg'}
        alt="Generic profile picture for anonymous user"
        width={size}
        height={size}
      />
    </Container>
  )
}

export const UserAvatar: React.FC<
  {
    user: Pick<ClientUserWithENSData, 'isPubliclyVisible' | 'primaryUserCryptoAddress'>
  } & Pick<ImageAvatarProps, 'size' | 'className'>
> = ({ user, size, ...props }) => {
  if (!user.isPubliclyVisible || !user.primaryUserCryptoAddress) {
    return <DefaultUserAvatar {...props} size={size} />
  }

  const primaryUserCryptoAddress = user.primaryUserCryptoAddress
  if (primaryUserCryptoAddress.ensAvatarUrl) {
    return (
      <Container>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          {...props}
          src={primaryUserCryptoAddress.ensAvatarUrl}
          alt={`ENS avatar for ${
            primaryUserCryptoAddress.ensName || primaryUserCryptoAddress.cryptoAddress
          }`}
          style={{
            width: size,
            height: size,
          }}
        />
      </Container>
    )
  }
  return (
    <Container>
      <NextImage
        {...props}
        src={deterministicArraySelection(
          genericImages,
          user.primaryUserCryptoAddress.cryptoAddress,
        )}
        alt="Generic profile picture for anonymous user"
        width={size}
        height={size}
      />
    </Container>
  )
}

export const SensitiveDataUserAvatar: React.FC<
  {
    user: Pick<
      SensitiveDataClientUserWithENSData,
      'firstName' | 'lastName' | 'isPubliclyVisible' | 'primaryUserCryptoAddress'
    >
  } & Pick<ImageAvatarProps, 'size' | 'className'>
> = ({ user, size, ...props }) => {
  if (!user.primaryUserCryptoAddress) {
    return <DefaultUserAvatar {...props} size={size} />
  }

  const primaryUserCryptoAddress = user.primaryUserCryptoAddress
  if (primaryUserCryptoAddress.ensAvatarUrl) {
    return (
      <Container>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          {...props}
          src={primaryUserCryptoAddress.ensAvatarUrl}
          alt={`ENS avatar for ${
            primaryUserCryptoAddress.ensName || primaryUserCryptoAddress.cryptoAddress
          }`}
          style={{
            width: size,
            height: size,
          }}
        />
      </Container>
    )
  }

  return (
    <Container>
      <NextImage
        {...props}
        src={deterministicArraySelection(
          genericImages,
          user.primaryUserCryptoAddress.cryptoAddress,
        )}
        alt="Generic profile picture for anonymous user"
        width={size}
        height={size}
      />
    </Container>
  )
}
