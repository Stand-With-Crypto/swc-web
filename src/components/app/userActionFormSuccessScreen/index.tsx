'use client'

import { JoinSWC } from '@/components/app/userActionFormSuccessScreen/joinSWC'
import { SMSOptInContent } from '@/components/app/userActionFormSuccessScreen/smsOptIn'
import {
  UserActionFormSuccessScreenNextAction,
  UserActionFormSuccessScreenNextActionSkeleton,
} from '@/components/app/userActionFormSuccessScreen/userActionFormSuccessScreenNextAction'
import { useApiResponseForUserPerformedUserActionTypes } from '@/hooks/useApiResponseForUserPerformedUserActionTypes'
import { useSession } from '@/hooks/useSession'

interface UserActionFormSuccessScreenProps {
  children: React.ReactNode
  onClose: () => void
}

export function UserActionFormSuccessScreen(props: UserActionFormSuccessScreenProps) {
  const { children, onClose } = props

  const { user, isLoggedIn, isLoading, fullProfileRequest } = useSession()
  const performedActionsResponse = useApiResponseForUserPerformedUserActionTypes({
    revalidateOnMount: true,
  })

  if (!isLoggedIn || !user) {
    return <JoinSWC onClose={onClose} />
  }

  if (!user.phoneNumber || !user.hasOptedInToSms) {
    if (fullProfileRequest.isLoading) {
      return <SMSOptInContent.Skeleton />
    }

    return (
      <div className="mx-auto h-full max-w-[450px]">
        <SMSOptInContent
          initialValues={{ phoneNumber: user.phoneNumber }}
          onSuccess={({ phoneNumber }) => {
            void fullProfileRequest.mutate({
              user: { ...user, phoneNumber, hasOptedInToSms: true },
            })
            void performedActionsResponse.mutate()
          }}
        />
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col gap-6 lg:max-h-[75vh]">
      {children}

      {isLoading || performedActionsResponse.isLoading ? (
        <UserActionFormSuccessScreenNextActionSkeleton />
      ) : (
        <UserActionFormSuccessScreenNextAction
          data={{
            userHasEmbeddedWallet: user.hasEmbeddedWallet,
            performedUserActionTypes:
              performedActionsResponse.data?.performedUserActionTypes.map(
                action => action.actionType,
              ) || [],
          }}
        />
      )}
    </div>
  )
}
