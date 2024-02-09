import { ClientUserWithENSData } from '@/clientModels/clientUser/clientUser'
import { SensitiveDataClientUserWithENSData } from '@/clientModels/clientUser/sensitiveDataClientUser'
import { NextImage } from '@/components/ui/image'
import { ImageAvatarProps } from '@/components/ui/imageAvatar'

import { deterministicArraySelection } from '@/utils/shared/deterministicArraySelection'
import { UserInformationVisibility } from '@prisma/client'

const genericImages = [
  '/userAvatars/blue.svg',
  '/userAvatars/green.svg',
  '/userAvatars/orange.svg',
  '/userAvatars/purple.svg',
  '/userAvatars/red.svg',
  '/userAvatars/yellow.svg',
]

const Container = ({ children }: { children: React.ReactNode }) => (
  <div className="inline-block overflow-hidden rounded-full">{children}</div>
)

function DefaultUserAvatar({ size, ...props }: Pick<ImageAvatarProps, 'size' | 'className'>) {
  return (
    <Container>
      <NextImage
        {...props}
        alt="Generic profile picture for anonymous user"
        height={size}
        src={'/userAvatars/grey.svg'}
        width={size}
      />
    </Container>
  )
}

export const UserAvatar: React.FC<
  {
    user: Pick<ClientUserWithENSData, 'informationVisibility' | 'primaryUserCryptoAddress'>
  } & Pick<ImageAvatarProps, 'size' | 'className'>
> = ({ user, size, ...props }) => {
  if (
    user.informationVisibility === UserInformationVisibility.ANONYMOUS ||
    !user.primaryUserCryptoAddress
  ) {
    return <DefaultUserAvatar {...props} size={size} />
  }

  const primaryUserCryptoAddress = user.primaryUserCryptoAddress
  if (primaryUserCryptoAddress.ensAvatarUrl) {
    return (
      <Container>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          {...props}
          alt={`ENS avatar for ${
            primaryUserCryptoAddress.ensName || primaryUserCryptoAddress.cryptoAddress
          }`}
          src={primaryUserCryptoAddress.ensAvatarUrl}
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
        alt="Generic profile picture for anonymous user"
        height={size}
        src={deterministicArraySelection(
          genericImages,
          user.primaryUserCryptoAddress.cryptoAddress,
        )}
        width={size}
      />
    </Container>
  )
}

export const SensitiveDataUserAvatar: React.FC<
  {
    user: Pick<
      SensitiveDataClientUserWithENSData,
      'firstName' | 'lastName' | 'primaryUserCryptoAddress'
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
          alt={`ENS avatar for ${
            primaryUserCryptoAddress.ensName || primaryUserCryptoAddress.cryptoAddress
          }`}
          src={primaryUserCryptoAddress.ensAvatarUrl}
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
        alt="Generic profile picture for anonymous user"
        height={size}
        src={deterministicArraySelection(
          genericImages,
          user.primaryUserCryptoAddress.cryptoAddress,
        )}
        width={size}
      />
    </Container>
  )
}
