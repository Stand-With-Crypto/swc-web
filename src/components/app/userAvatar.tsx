import React from 'react'

import { ClientUserWithENSData } from '@/clientModels/clientUser/clientUser'
import { NextImage } from '@/components/ui/image'
import { ImageAvatarProps } from '@/components/ui/imageAvatar'
import { ImageWithFallbackOnError } from '@/components/ui/imageWithFallbackOnError'
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
  <div className="inline-block overflow-hidden rounded-full">{children}</div>
)

export const UserAvatar: React.FC<
  {
    user: Pick<
      ClientUserWithENSData,
      'informationVisibility' | 'primaryUserCryptoAddress' | 'id' | 'manuallySetInformation'
    >
  } & Pick<ImageAvatarProps, 'size' | 'className'>
> = ({ user, size, ...props }) => {
  const primaryUserCryptoAddress = user.primaryUserCryptoAddress
  if (primaryUserCryptoAddress?.ensAvatarUrl) {
    return (
      <Container>
        <ImageWithFallbackOnError
          {...props}
          alt={`ENS avatar for ${
            primaryUserCryptoAddress.ensName || primaryUserCryptoAddress.cryptoAddress
          }`}
          fallbackSrc={deterministicArraySelection(genericImages, user.id)}
          src={primaryUserCryptoAddress.ensAvatarUrl}
          style={{ width: size, height: size }}
        />
      </Container>
    )
  }
  if (user.manuallySetInformation) {
    return (
      <Container>
        <ImageWithFallbackOnError
          {...props}
          alt={`${user.manuallySetInformation.displayName} profile picture`}
          fallbackSrc={deterministicArraySelection(genericImages, user.id)}
          src={user.manuallySetInformation.profilePictureUrl}
          style={{ width: size, height: size }}
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
        src={deterministicArraySelection(genericImages, user.id)}
        width={size}
      />
    </Container>
  )
}
