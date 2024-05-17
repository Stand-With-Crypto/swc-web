import { ReactNode } from 'react'

import { MaybeAuthenticatedContent } from '@/components/app/authentication/maybeAuthenticatedContent'
import { ThirdwebLoginContent } from '@/components/app/authentication/thirdwebLoginContent'
import { UpdateUserProfileForm } from '@/components/app/updateUserProfileForm/step1/control'
import { Skeleton } from '@/components/ui/skeleton'
import { useApiResponseForUserFullProfileInfo } from '@/hooks/useApiResponseForUserFullProfileInfo'
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

  const user = userData?.user

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
          <div className="flex flex-col items-center">
            <Skeleton className="h-80 w-full" />
            <Skeleton className="mt-8 h-20 w-full" />
            <Skeleton className="mt-8 h-20 w-60" />
          </div>
        )
      }
    >
      <ThirdwebLoginContent />
    </MaybeAuthenticatedContent>
  )
}
