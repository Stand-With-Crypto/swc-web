'use client'

import { useEffect } from 'react'

import { JoinSWC } from '@/components/app/userActionFormSuccessScreen/joinSWC'
import { SMSOptInContent } from '@/components/app/userActionFormSuccessScreen/smsOptIn'
import {
  UserActionFormSuccessScreenNextAction,
  UserActionFormSuccessScreenNextActionSkeleton,
} from '@/components/app/userActionFormSuccessScreen/userActionFormSuccessScreenNextAction'
import { dialogContentPaddingStyles } from '@/components/ui/dialog/styles'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useApiResponseForUserPerformedUserActionTypes } from '@/hooks/useApiResponseForUserPerformedUserActionTypes'
import { useSession } from '@/hooks/useSession'
import { cn } from '@/utils/web/cn'

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

  /**
   * This effect is to avoid having stale actions data when the user
   * logs in (from the success screen) after performing an action.
   */
  useEffect(() => {
    if (isLoggedIn) {
      void performedActionsResponse.mutate()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoggedIn])

  if (!isLoggedIn || !user) {
    return <JoinSWC onClose={onClose} />
  }

  if (!user.phoneNumber || !user.hasOptedInToSms) {
    if (fullProfileRequest.isLoading) {
      return <SMSOptInContent.Skeleton />
    }

    return (
      <SMSOptInContent
        initialValues={{ phoneNumber: user.phoneNumber }}
        onSuccess={({ phoneNumber }) => {
          void fullProfileRequest.mutate({
            user: { ...user, phoneNumber, hasOptedInToSms: true },
          })
          void performedActionsResponse.mutate()
        }}
      />
    )
  }

  return (
    <ScrollArea
      className={cn(
        dialogContentPaddingStyles,
        // Negative margins with the same values as the dialog padding
        // to better display the scroll bar.
        '-mx-6 -mb-6 overflow-auto max-md:-mt-20 md:-mt-14 lg:max-h-[75vh]',
      )}
    >
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
    </ScrollArea>
  )
}
