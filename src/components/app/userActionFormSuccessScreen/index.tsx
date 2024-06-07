'use client'

import { useSWRConfig } from 'swr'

import { JoinSWC } from '@/components/app/userActionFormSuccessScreen/joinSWC'
import { SMSOptInContent } from '@/components/app/userActionFormSuccessScreen/smsOptIn'
import {
  UserActionFormSuccessScreenNextAction,
  UserActionFormSuccessScreenNextActionSkeleton,
} from '@/components/app/userActionFormSuccessScreen/userActionFormSuccessScreenNextAction'
import { useApiResponseForUserPerformedUserActionTypes } from '@/hooks/useApiResponseForUserPerformedUserActionTypes'
import { useSession } from '@/hooks/useSession'
import { apiUrls } from '@/utils/shared/urls'
import { cn } from '@/utils/web/cn'

interface UserActionFormSuccessScreenProps {
  children: React.ReactNode
  onClose: () => void
}

export function UserActionFormSuccessScreen(props: UserActionFormSuccessScreenProps) {
  const { children, onClose } = props

  const { user, isLoggedIn, isLoading } = useSession()
  const performedActionsResponse = useApiResponseForUserPerformedUserActionTypes({
    revalidateOnMount: true,
  })
  const { mutate } = useSWRConfig()

  if (!isLoggedIn || !user) {
    return <JoinSWC onClose={onClose} />
  }

  if (!user.phoneNumber || !user.hasOptedInToSms) {
    if (isLoading) {
      return <SMSOptInContent.Skeleton />
    }

    return (
      <SMSOptInContent
        initialValues={{ phoneNumber: user.phoneNumber }}
        onSuccess={({ phoneNumber }) => {
          void mutate(apiUrls.userFullProfileInfo(), {
            ...user,
            phoneNumber,
            hasOptedInToSms: true,
          })
          void performedActionsResponse.mutate()
        }}
      />
    )
  }

  return (
    <div className={cn('flex h-full flex-col gap-6')}>
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
