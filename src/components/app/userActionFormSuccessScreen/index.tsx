'use client'

import { SMSStatus } from '@prisma/client'
import { noop } from 'lodash-es'
import { useSWRConfig } from 'swr'

import { JoinSWC } from '@/components/app/userActionFormSuccessScreen/joinSWC'
import { SMSOptInContent } from '@/components/app/userActionFormSuccessScreen/smsOptIn'
import {
  UserActionFormSuccessScreenNextAction,
  UserActionFormSuccessScreenNextActionSkeleton,
} from '@/components/app/userActionFormSuccessScreen/userActionFormSuccessScreenNextAction'
import { useApiResponseForUserPerformedUserActionTypes } from '@/hooks/useApiResponseForUserPerformedUserActionTypes'
import { useEffectOnce } from '@/hooks/useEffectOnce'
import { useSession } from '@/hooks/useSession'
import { apiUrls } from '@/utils/shared/urls'
import { cn } from '@/utils/web/cn'

interface UserActionFormSuccessScreenProps {
  children: React.ReactNode
  onClose: () => void
  onLoad?: () => void
  skipNextActions?: boolean
}

export function UserActionFormSuccessScreen(props: UserActionFormSuccessScreenProps) {
  const { children, onClose, skipNextActions } = props

  const { user, isLoggedIn, isLoading } = useSession()
  const performedActionsResponse = useApiResponseForUserPerformedUserActionTypes({
    revalidateOnMount: true,
  })
  const { mutate } = useSWRConfig()

  useEffectOnce(props.onLoad ?? noop)

  useEffectOnce(() => {
    // This revalidation is used to revalidate the user's completed actions list
    // after they complete any action
    void mutate(apiUrls.userFullProfileInfo())
    void mutate(apiUrls.userPerformedUserActionTypes())
  })

  if (!isLoggedIn || !user) {
    return <JoinSWC onClose={onClose} />
  }

  if (!user.phoneNumber || user.smsStatus === SMSStatus.NOT_OPTED_IN) {
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
          })
          void performedActionsResponse.mutate()
        }}
      />
    )
  }

  return (
    <div className={cn('flex h-full flex-col gap-8 p-0 md:p-8')}>
      {children}

      {(!skipNextActions && isLoading) || performedActionsResponse.isLoading ? (
        <UserActionFormSuccessScreenNextActionSkeleton />
      ) : (
        !skipNextActions && (
          <UserActionFormSuccessScreenNextAction
            data={{
              userHasEmbeddedWallet: user.hasEmbeddedWallet,
              performedUserActionTypes:
                performedActionsResponse.data?.performedUserActionTypes || [],
            }}
          />
        )
      )}
    </div>
  )
}
