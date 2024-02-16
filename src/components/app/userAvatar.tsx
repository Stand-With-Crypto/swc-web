import { ClientUserWithENSData } from '@/clientModels/clientUser/clientUser'
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
  <div className="inline-block overflow-hidden rounded-full">{children}</div>
)

export const UserAvatar: React.FC<
  {
    user: Pick<ClientUserWithENSData, 'informationVisibility' | 'primaryUserCryptoAddress' | 'id'>
  } & Pick<ImageAvatarProps, 'size' | 'className'>
> = ({ user, size, ...props }) => {
  const primaryUserCryptoAddress = user.primaryUserCryptoAddress
  if (primaryUserCryptoAddress?.ensAvatarUrl) {
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
        src={deterministicArraySelection(genericImages, user.id)}
        width={size}
      />
    </Container>
  )
}
