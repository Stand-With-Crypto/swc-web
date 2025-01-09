'use client'

import { LoginDialogWrapper } from '@/components/app/authentication/loginDialogWrapper'
import { PageUserProfileUser } from '@/components/app/pageUserProfile/getAuthenticatedData'
import { UpdateUserProfileFormDialog } from '@/components/app/updateUserProfileForm/dialog'
import { Button } from '@/components/ui/button'
import { useSession } from '@/hooks/useSession'
import { hasCompleteUserProfile } from '@/utils/web/hasCompleteUserProfile'

export function ProfileAndNFTButtons({ user }: { user: PageUserProfileUser }) {
  return (
    <div className="flex items-center gap-4">
      <LoginDialogWrapper
        authenticatedContent={null}
        subtitle="Confirm your email address or connect a wallet to receive your NFT."
        title="Claim your free NFT"
        useThirdwebSession
      >
        <Button className="w-full lg:w-auto">Claim my NFTs</Button>
      </LoginDialogWrapper>

      <EditProfileButton user={user} />
    </div>
  )
}

function EditProfileButton({ user }: { user: PageUserProfileUser }) {
  const session = useSession()

  return (
    <UpdateUserProfileFormDialog user={user}>
      {hasCompleteUserProfile(user) ? (
        <Button className="w-full lg:w-auto" variant="secondary">
          Edit <span className="mx-1 hidden sm:inline-block">your</span> profile
        </Button>
      ) : (
        <Button
          className="w-full lg:w-auto"
          variant={session.isLoggedInThirdweb ? 'default' : 'secondary'}
        >
          Finish <span className="mx-1 hidden sm:inline-block">your</span> profile
        </Button>
      )}
    </UpdateUserProfileFormDialog>
  )
}
