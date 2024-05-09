import { ReactNode, useMemo } from 'react'
import { useENS } from '@thirdweb-dev/react'

import { MaybeAuthenticatedContent } from '@/components/app/authentication/maybeAuthenticatedContent'
import { ThirdwebLoginContent } from '@/components/app/authentication/thirdwebLoginContent'
import { UpdateUserProfileForm } from '@/components/app/updateUserProfileForm/step1'
import { Skeleton } from '@/components/ui/skeleton'
import { useApiResponseForUserFullProfileInfo } from '@/hooks/useApiResponseForUserFullProfileInfo'
import { appendENSHookDataToUser } from '@/utils/web/appendENSHookDataToUser'
import { hasCompleteUserProfile } from '@/utils/web/hasCompleteUserProfile'

interface AuthenticateAndUpdateProfileProps {
  children: ReactNode
  onProfileUpdateSuccess?: (updatedUserFields: { firstName: string; lastName: string }) => void
}

export function AuthenticateWithProfileUpdate({
  children,
  onProfileUpdateSuccess = () => {},
}: AuthenticateAndUpdateProfileProps) {
  const { data: userData, mutate } = useApiResponseForUserFullProfileInfo()
  const { data: ensData, isLoading: isLoadingEnsData } = useENS()

  const user = useMemo(() => {
    if (!userData?.user || isLoadingEnsData) {
      return null
    }

    return appendENSHookDataToUser(userData.user, ensData)
  }, [ensData, isLoadingEnsData, userData])

  return (
    <MaybeAuthenticatedContent
      authenticatedContent={
        user ? (
          hasCompleteUserProfile(user) ? (
            children
          ) : (
            <UpdateUserProfileForm
              onSuccess={updatedUserFields => {
                onProfileUpdateSuccess(updatedUserFields)
                void mutate()
              }}
              shouldFieldsBeRequired
              user={user}
            />
          )
        ) : (
          <>
            <Skeleton className="h-80 w-full" />
            <Skeleton className="mt-8 h-20 w-full" />
          </>
        )
      }
    >
      <ThirdwebLoginContent />
    </MaybeAuthenticatedContent>
  )
}
