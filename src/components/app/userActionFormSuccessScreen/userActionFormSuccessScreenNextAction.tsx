'use client'

import { SuccessScreenCTAS } from '@/components/app/userActionGridCTAs/successScreenCTAS'
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

      <Skeleton className="h-40 w-full" />
      <Skeleton className="h-40 w-full" />
      <Skeleton className="h-40 w-full" />
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
      <SuccessScreenCTAS
        excludeUserActionTypes={[...Array.from(excludeUserActionTypes)]}
        performedUserActionTypes={performedUserActionTypes}
      />
    </div>
  )
}
