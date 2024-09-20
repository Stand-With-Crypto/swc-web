'use client'

import { SuccessScreenCTAS } from '@/components/app/userActionGridCTAs/successScreenCTAS'
import { UserActionRowCTAButtonSkeleton } from '@/components/app/userActionRowCTA'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import {
  getUserActionsProgress,
  GetUserActionsProgressArgs,
} from '@/utils/shared/getUserActionsProgress'

export function UserActionFormSuccessScreenNextActionSkeleton() {
  return (
    <div className="space-y-6 text-center">
      <Skeleton>
        <Progress />
      </Skeleton>

      <UserActionRowCTAButtonSkeleton />
      <UserActionRowCTAButtonSkeleton />
      <UserActionRowCTAButtonSkeleton />
    </div>
  )
}

interface UserActionFormSuccessScreenNextActionProps {
  data: GetUserActionsProgressArgs
}

export function UserActionFormSuccessScreenNextAction({
  data,
}: UserActionFormSuccessScreenNextActionProps) {
  const { performedUserActionTypes, userHasEmbeddedWallet } = data

  const { excludeUserActionTypes } = getUserActionsProgress({
    userHasEmbeddedWallet,
    performedUserActionTypes,
  })

  return (
    <div className="space-y-6 pb-8 text-center">
      <h3 className="font-mono font-bold">Your voter guide</h3>

      <SuccessScreenCTAS
        excludeUserActionTypes={[...Array.from(excludeUserActionTypes)]}
        performedUserActionTypes={performedUserActionTypes}
      />
    </div>
  )
}
