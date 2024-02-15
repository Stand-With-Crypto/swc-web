'use client'
import { useRouter } from 'next/navigation'

import { GetUserPerformedUserActionTypesResponse } from '@/app/api/identified-user/performed-user-action-types/route'
import {
  UserActionRowCTA,
  UserActionRowCTAButton,
  UserActionRowCTAButtonSkeleton,
} from '@/components/app/userActionRowCTA'
import { ORDERED_USER_ACTION_ROW_CTA_INFO } from '@/components/app/userActionRowCTA/constants'
import { Skeleton } from '@/components/ui/skeleton'
import { useLocale } from '@/hooks/useLocale'
import {
  USER_ACTION_DEEPLINK_MAP,
  UserActionTypesWithDeeplink,
} from '@/utils/shared/urlsDeeplinkUserActions'

import { getNextAction } from './getNextAction'

export function UserActionFormSuccessScreenNextAction({
  data,
}: {
  data?: {
    performedUserActionTypes: GetUserPerformedUserActionTypesResponse['performedUserActionTypes']
  }
}) {
  const router = useRouter()
  const locale = useLocale()
  if (!data) {
    return (
      <div>
        <div className="font-bold">
          <Skeleton>Up next</Skeleton>
        </div>
        <Skeleton className="h-24 w-full" />
      </div>
    )
  }
  const { performedUserActionTypes } = data
  const nextAction = getNextAction(performedUserActionTypes)
  if (!nextAction) {
    return null
  }
  return (
    <div className="mt-8">
      <div className="mb-2 font-bold">Up next</div>
      {/*
        We can't open a modal within a modal, and so we redirect the user to our deeplink modal pages.
        There might be better options but this seems like the path of least resistance with minimal UX downside ¯\_(ツ)_/¯
        */}
      {nextAction.actionType in USER_ACTION_DEEPLINK_MAP ? (
        <UserActionRowCTAButton
          {...nextAction}
          onClick={() =>
            router.replace(
              USER_ACTION_DEEPLINK_MAP[
                nextAction.actionType as UserActionTypesWithDeeplink
              ].getDeeplinkUrl({ locale }),
            )
          }
          state="unknown"
        />
      ) : (
        <UserActionRowCTA
          state="unknown"
          {...nextAction}
          WrapperComponent={
            ORDERED_USER_ACTION_ROW_CTA_INFO.find(x => x.actionType === nextAction.actionType)!
              .WrapperComponent
          }
        />
      )}
    </div>
  )
}

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
