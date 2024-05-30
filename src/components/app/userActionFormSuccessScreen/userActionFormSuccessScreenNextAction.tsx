'use client'

import { useCallback, useState } from 'react'
import { useDebounce } from 'react-use'

import {
  UserActionRowCTAButton,
  UserActionRowCTAButtonSkeleton,
} from '@/components/app/userActionRowCTA'
import { UserActionRowCTAsList } from '@/components/app/userActionRowCTA/userActionRowCTAsList'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { useLocale } from '@/hooks/useLocale'
import {
  getUserActionsProgress,
  GetUserActionsProgressArgs,
} from '@/utils/shared/getUserActionsProgress'
import {
  USER_ACTION_DEEPLINK_MAP,
  UserActionTypesWithDeeplink,
} from '@/utils/shared/urlsDeeplinkUserActions'
import { USER_ACTION_TYPE_CTA_PRIORITY_ORDER } from '@/utils/web/userActionUtils'

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

export interface UserActionFormSuccessScreenNextActionProps {
  data: GetUserActionsProgressArgs
}

export function UserActionFormSuccessScreenNextAction({
  data,
}: UserActionFormSuccessScreenNextActionProps) {
  const locale = useLocale()

  /**
   * there's a bug where if you use next.js router to push a new url, the modal doesn't close
   * using location.href instead to force a page reload resolves the issue.
   * TODO: We should figure out why the modal won't close on page transition
   */
  const handleClick = useCallback(
    (actionType: UserActionTypesWithDeeplink) => () => {
      if (!USER_ACTION_DEEPLINK_MAP[actionType]) return
      window.location.href = USER_ACTION_DEEPLINK_MAP[actionType].getDeeplinkUrl({ locale })
    },
    [locale],
  )

  const { performedUserActionTypes, userHasEmbeddedWallet } = data

  const { progressValue, excludeUserActionTypes } = getUserActionsProgress({
    userHasEmbeddedWallet,
    performedUserActionTypes,
  })

  const [debouncedProgressValue, setDebouncedProgressValue] = useState(0)
  useDebounce(() => setDebouncedProgressValue(progressValue), 333, [progressValue])

  return (
    <div className="space-y-6 text-center">
      <Progress value={debouncedProgressValue} />

      {/** Uncompleted actions first */}
      <UserActionRowCTAsList
        excludeUserActionTypes={[...excludeUserActionTypes, ...performedUserActionTypes]}
        render={ctaProps => (
          <UserActionRowCTAButton
            {...ctaProps}
            key={ctaProps.actionType}
            onClick={handleClick(ctaProps.actionType as UserActionTypesWithDeeplink)}
            state="incomplete"
          />
        )}
      />

      {/** Completed actions last */}
      <UserActionRowCTAsList
        excludeUserActionTypes={USER_ACTION_TYPE_CTA_PRIORITY_ORDER.filter(
          actionType => !performedUserActionTypes.includes(actionType),
        )}
        performedUserActionTypes={performedUserActionTypes}
        render={ctaProps => (
          <UserActionRowCTAButton
            {...ctaProps}
            key={ctaProps.actionType}
            onClick={handleClick(ctaProps.actionType as UserActionTypesWithDeeplink)}
          />
        )}
      />
    </div>
  )
}
