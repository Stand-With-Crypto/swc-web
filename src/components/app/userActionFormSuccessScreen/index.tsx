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
  isVotingDay?: boolean
}

export function UserActionFormSuccessScreen(props: UserActionFormSuccessScreenProps) {
  const { children, onClose, isVotingDay } = props

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
    return (
      <JoinSWC
        isVotingDay={isVotingDay}
        onClose={onClose}
        {...(isVotingDay && {
          title: 'Nice work! Claim your free NFT.',
          description: 'Join Stand With Crypto or sign in to claim your free “I voted” NFT.',
        })}
      />
    )
  }

  if (!isVotingDay && (!user.phoneNumber || user.smsStatus === SMSStatus.NOT_OPTED_IN)) {
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

      {(!isVotingDay && isLoading) || performedActionsResponse.isLoading ? (
        <UserActionFormSuccessScreenNextActionSkeleton />
      ) : (
        !isVotingDay && (
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
