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
  getUserActionDeeplink,
  UserActionTypesWithDeeplink,
} from '@/utils/shared/urlsDeeplinkUserActions'
import { UserActionCampaigns } from '@/utils/shared/userActionCampaigns'
import { USER_ACTION_TYPE_CTA_PRIORITY_ORDER_WITH_CAMPAIGN } from '@/utils/web/userActionUtils'

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
  const locale = useLocale()

  /**
   * there's a bug where if you use next.js router to push a new url, the modal doesn't close
   * using location.href instead to force a page reload resolves the issue.
   * TODO: We should figure out why the modal won't close on page transition
   */
  const handleClick = useCallback(
    (
      actionType: UserActionTypesWithDeeplink,
      campaign?: UserActionCampaigns[UserActionTypesWithDeeplink],
    ) =>
      () => {
        const url = getUserActionDeeplink({
          actionType,
          config: {
            locale,
          },
          campaign,
        })

        if (!url) return
        window.location.href = url
      },
    [locale],
  )

  const { performedUserActionTypes, userHasEmbeddedWallet } = data

  const { progressValue, excludeUserActionTypes, numActionsCompleted, numActionsAvailable } =
    getUserActionsProgress({
      userHasEmbeddedWallet,
      performedUserActionTypes,
    })

  const [debouncedProgressValue, setDebouncedProgressValue] = useState(0)
  useDebounce(() => setDebouncedProgressValue(progressValue), 333, [progressValue])

  return (
    <div className="space-y-6 text-center">
      <div className="space-y-3">
        <Progress value={debouncedProgressValue} />
        <p className="text-fontcolor-muted">
          You've completed {numActionsCompleted} out of {numActionsAvailable} actions.{' '}
          {numActionsCompleted === numActionsAvailable ? 'Great job!' : 'Keep going!'}
        </p>
      </div>

      {/** Uncompleted actions first */}
      <UserActionRowCTAsList
        excludeUserActionTypes={[
          ...Array.from(excludeUserActionTypes),
          ...performedUserActionTypes.map(({ actionType }) => actionType),
        ]}
        performedUserActionTypes={performedUserActionTypes}
        render={ctaProps => {
          return (
            <UserActionRowCTAButton
              {...ctaProps}
              onClick={handleClick(
                ctaProps.actionType,
                ctaProps?.campaign as UserActionCampaigns[UserActionTypesWithDeeplink],
              )}
            />
          )
        }}
      />

      {/** Completed actions last */}
      <UserActionRowCTAsList
        excludeUserActionTypes={[
          ...Array.from(excludeUserActionTypes),
          ...USER_ACTION_TYPE_CTA_PRIORITY_ORDER_WITH_CAMPAIGN.filter(
            ({ action }) =>
              !performedUserActionTypes.some(
                performedAction => performedAction.actionType === action,
              ),
          ).map(({ action }) => action),
        ]}
        performedUserActionTypes={performedUserActionTypes}
        render={ctaProps => (
          <UserActionRowCTAButton
            {...ctaProps}
            onClick={handleClick(
              ctaProps.actionType,
              ctaProps?.campaign as UserActionCampaigns[UserActionTypesWithDeeplink],
            )}
          />
        )}
      />
    </div>
  )
}
