'use client'
import { useRouter } from 'next/navigation'

import { GetUserPerformedUserActionTypesResponse } from '@/app/api/identified-user/performed-user-action-types/route'
import { UserActionRowCTAButton } from '@/components/app/userActionRowCTA'
import { Skeleton } from '@/components/ui/skeleton'
import { useLocale } from '@/hooks/useLocale'
import { USER_ACTION_DEEPLINK_MAP } from '@/utils/shared/urlsDeeplinkUserActions'

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
    <div>
      <div className="mb-2 font-bold">Up next</div>
      {/* 
        We can't open a modal within a modal, and so we redirect the user to our deeplink modal pages. 
        There might be better options but this seems like the path of least resistance with minimal UX downside ¯\_(ツ)_/¯ 
        */}
      <UserActionRowCTAButton
        {...nextAction}
        onClick={() =>
          router.replace(USER_ACTION_DEEPLINK_MAP[nextAction.actionType].getDeeplinkUrl({ locale }))
        }
        state="unknown"
      />
    </div>
  )
}
