import React from 'react'
import { useENS } from '@thirdweb-dev/react'

import { LazyUpdateUserProfileForm } from '@/components/app/updateUserProfileForm/lazyLoad'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { useApiResponseForUserFullProfileInfo } from '@/hooks/useApiResponseForUserFullProfileInfo'
import { useAuthUser } from '@/hooks/useAuthUser'
import { useDialog } from '@/hooks/useDialog'
import { appendENSHookDataToUser } from '@/utils/web/appendENSHookDataToUser'
import { getLocalUser, setLocalUserPersistedValues } from '@/utils/web/clientLocalUser'

import { MaybeAuthenticatedContent } from './maybeAuthenticatedContent'
import { ThirdwebLoginDialog } from './thirdwebLoginContent'

interface LoginDialogWrapperProps extends React.PropsWithChildren {
  authenticatedContent: React.ReactNode
}

export function LoginDialogWrapper({ children, authenticatedContent }: LoginDialogWrapperProps) {
  const dialogProps = useDialog({ analytics: 'Finish Profile' })
  const [hasCompletedProfile, setHasCompletedProfile] = React.useState(false)

  const { user } = useAuthUser()

  const handleFinishProfileDialogOpenChange = React.useCallback(
    (open: boolean) => {
      dialogProps.onOpenChange(open)

      if (!open) {
        setHasCompletedProfile(true)
        setLocalUserPersistedValues({
          hasSeenCompleteProfilePrompt: true,
        })
      }
    },
    [dialogProps],
  )

  React.useEffect(() => {
    if (!user || hasCompletedProfile) {
      return
    }

    const localUser = getLocalUser()

    // TODO invert
    if (!user.session?.isNewlyCreatedUser && !localUser.persisted?.hasSeenCompleteProfilePrompt) {
      handleFinishProfileDialogOpenChange(true)
    }
  }, [user, dialogProps, hasCompletedProfile, handleFinishProfileDialogOpenChange])

  return (
    <>
      <MaybeAuthenticatedContent authenticatedContent={authenticatedContent}>
        <ThirdwebLoginDialog>{children}</ThirdwebLoginDialog>
      </MaybeAuthenticatedContent>
      <Dialog {...dialogProps} onOpenChange={handleFinishProfileDialogOpenChange}>
        <DialogContent className="max-w-l w-full">
          <FinishProfileDialog
            onSkip={() => handleFinishProfileDialogOpenChange(false)}
            onSuccess={() => handleFinishProfileDialogOpenChange(false)}
          />
        </DialogContent>
      </Dialog>
    </>
  )
}

function FinishProfileDialog({ onSkip, onSuccess }: { onSkip: () => void; onSuccess: () => void }) {
  const { data: userData } = useApiResponseForUserFullProfileInfo()
  const { data: ensData, isLoading: isLoadingEnsData } = useENS()

  const user = React.useMemo(() => {
    if (!userData?.user || isLoadingEnsData) {
      return null
    }

    return appendENSHookDataToUser(userData.user, ensData)
  }, [ensData, isLoadingEnsData, userData])

  const loadingRender = <Skeleton className="h-80 w-full" />
  if (!user) {
    return loadingRender
  }

  return (
    <React.Suspense fallback={loadingRender}>
      <LazyUpdateUserProfileForm onSkip={onSkip} onSuccess={onSuccess} user={user} />
    </React.Suspense>
  )
}
