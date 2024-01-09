'use client'
import { UserActionRowCTA } from '@/components/app/userActionRowCTA'
import { ORDERED_USER_ACTION_ROW_CTA_INFO } from '@/components/app/userActionRowCTA/userActionRowCTAsList'
import { Button } from '@/components/ui/button'
import { PageSubTitle } from '@/components/ui/pageSubTitle'
import { PageTitle } from '@/components/ui/pageTitleText'
import { Skeleton } from '@/components/ui/skeleton'
import { useApiResponseForUserPerformedUserActionTypes } from '@/hooks/useApiResponseForUserPerformedUserActionTypes'
import { useUser } from '@thirdweb-dev/react'
import { useMemo } from 'react'

export function UserActionFormSuccessScreen() {
  const authUser = useUser()
  const { data } = useApiResponseForUserPerformedUserActionTypes()
  const nextAction = useMemo(() => {
    return ORDERED_USER_ACTION_ROW_CTA_INFO.find(
      action => !data?.performedUserActionTypes.includes(action.actionType),
    )
  }, [data])
  if ((!authUser.user && authUser.isLoading) || !data?.performedUserActionTypes) {
    return (
      <div className="p-6">
        <div className="space-y-2 py-24 text-center">
          <PageTitle size="sm">
            <Skeleton>Nice work!</Skeleton>
          </PageTitle>
          <PageSubTitle>
            <Skeleton>
              Join to unlock rewards, see your activities and get personalized contents.
            </Skeleton>
          </PageSubTitle>
          <Button variant="secondary">
            <Skeleton>Join Stand with Crypto</Skeleton>
          </Button>
        </div>
        <div>
          <div className="font-bold">
            <Skeleton>Up next</Skeleton>
          </div>
          <Skeleton className="h-24 w-full" />
        </div>
      </div>
    )
  }
  return (
    <div className="p-6">
      <div className="space-y-2 py-24 text-center">
        <PageTitle size="sm">Nice work!</PageTitle>
        {authUser.isLoggedIn ? (
          <>
            <PageSubTitle>
              You did your part to save cryptocurrency, but the fight isn't over yet.
            </PageSubTitle>
            <Button variant="secondary">Share on Twitter/X (TODO)</Button>
          </>
        ) : (
          <>
            <PageSubTitle>
              Join to unlock rewards, see your activities and get personalized contents.
            </PageSubTitle>
            <Button variant="secondary">Join Stand with Crypto (TODO)</Button>
          </>
        )}
      </div>
      <div>
        <div className="font-bold">Up next</div>
        {/* TODO fix modals opening, nested under each other */}
        {nextAction && <UserActionRowCTA {...nextAction} state="unknown" />}
      </div>
    </div>
  )
}
