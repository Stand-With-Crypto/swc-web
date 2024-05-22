'use client'

import { useCallback } from 'react'

import { GetUserFullProfileInfoResponse } from '@/app/api/identified-user/full-profile-info/route'
import { GetUserPerformedUserActionTypesResponse } from '@/app/api/identified-user/performed-user-action-types/route'
import { UserActionRowCTA, UserActionRowCTAButtonSkeleton } from '@/components/app/userActionRowCTA'
import { USER_ACTION_ROW_CTA_INFO } from '@/components/app/userActionRowCTA/constants'
import { UserActionRowCTAsList } from '@/components/app/userActionRowCTA/userActionRowCTAsList'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { useLocale } from '@/hooks/useLocale'
import { getUserActionsProgress } from '@/utils/shared/getUserActionsProgress'
import {
  USER_ACTION_DEEPLINK_MAP,
  UserActionTypesWithDeeplink,
} from '@/utils/shared/urlsDeeplinkUserActions'

import { getNextAction } from './getNextAction'

export function UserActionFormSuccessScreenNextActionSkeleton() {
  return (
    <div>
      <Skeleton>
        <div className="mb-2 font-bold">Up next</div>
      </Skeleton>
      <UserActionRowCTAButtonSkeleton />
    </div>
  )
}

export interface UserActionFormSuccessScreenNextActionProps {
  data?: {
    user: GetUserFullProfileInfoResponse['user']
    performedUserActionTypes: GetUserPerformedUserActionTypesResponse['performedUserActionTypes']
  }
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

  if (!data) {
    return <UserActionFormSuccessScreenNextActionSkeleton />
  }

  const { performedUserActionTypes, user } = data

  const { progressValue, numActionsCompleted, numActionsAvailable, excludeUserActionTypes } =
    getUserActionsProgress({
      user,
      performedUserActionTypes,
    })

  return (
    <div className="space-y-6 text-center">
      <p className="text-fontcolor-muted">
        Complete the actions below to continue your progress as a crypto advocate.
      </p>

      <Progress data-max={numActionsAvailable} value={progressValue} />

      <UserActionRowCTAsList
        excludeUserActionTypes={['NFT_MINT', ...performedUserActionTypes.map(x => x.actionType)]}
        performedUserActionTypes={performedUserActionTypes}
        render={ctaProps => (
          <UserActionRowCTA
            {...ctaProps}
            key={ctaProps.actionType}
            onClick={handleClick(ctaProps.actionType as UserActionTypesWithDeeplink)}
          />
        )}
      />

      {performedUserActionTypes.map(performedAction => {
        if (performedAction.actionType in USER_ACTION_ROW_CTA_INFO) {
          const ctaProps =
            USER_ACTION_ROW_CTA_INFO[
              performedAction.actionType as keyof typeof USER_ACTION_ROW_CTA_INFO
            ]

          return (
            <UserActionRowCTA
              {...ctaProps}
              key={performedAction.actionType}
              onClick={handleClick(ctaProps.actionType as UserActionTypesWithDeeplink)}
              state="complete"
            />
          )
        }

        return null
      })}
    </div>
  )
}
