import { ClientUser } from '@/clientModels/clientUser/clientUser'
import { SensitiveDataClientUser } from '@/clientModels/clientUser/sensitiveDataClientUser'
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

// TODO support ENS images and person name
export const UserAvatar: React.FC<
  {
    user: Pick<ClientUser, 'isPubliclyVisible' | 'cryptoAddress'>
  } & Pick<ImageAvatarProps, 'size' | 'className'>
> = ({ user, size, ...props }) => {
  if (!user.isPubliclyVisible || !user.cryptoAddress) {
    return <DefaultUserAvatar {...props} size={size} />
  }

  // TODO: Remove this type cast once we have ENS data in the client
  // This was made to avoid stepping on the toes of the PR that adds ENS data to the client
  // see https://github.com/Stand-With-Crypto/swc-web/pull/80
  const cryptoAddress = user.cryptoAddress as any
  if (cryptoAddress.ensAvatarUrl) {
    return (
      <Container>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          {...props}
          src={cryptoAddress.ensAvatarUrl}
          alt={`ENS avatar for ${cryptoAddress.ensName || cryptoAddress.address}`}
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
        src={deterministicArraySelection(genericImages, user.cryptoAddress.address)}
        alt="Generic profile picture for anonymous user"
        width={size}
        height={size}
      />
    </Container>
  )
}

export const SensitiveDataUserAvatar: React.FC<
  {
    user: Pick<SensitiveDataClientUser, 'fullName' | 'isPubliclyVisible' | 'cryptoAddress'>
  } & Pick<ImageAvatarProps, 'size' | 'className'>
> = ({ user, size, ...props }) => {
  if (!user.cryptoAddress) {
    return <DefaultUserAvatar {...props} size={size} />
  }

  // TODO: Remove this type cast once we have ENS data in the client
  // This was made to avoid stepping on the toes of the PR that adds ENS data to the client
  // see https://github.com/Stand-With-Crypto/swc-web/pull/80
  const cryptoAddress = user.cryptoAddress as any
  if (cryptoAddress.ensAvatarUrl) {
    return (
      <Container>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          {...props}
          src={cryptoAddress.ensAvatarUrl}
          alt={`ENS avatar for ${cryptoAddress.ensName || cryptoAddress.address}`}
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
        src={deterministicArraySelection(genericImages, user.cryptoAddress.address)}
        alt="Generic profile picture for anonymous user"
        width={size}
        height={size}
      />
    </Container>
  )
}
