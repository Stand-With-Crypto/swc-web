import { UserActionFormLayout } from '@/components/app/userActionFormCommon'
import { UserActionLiveEventProps } from '@/components/app/userActionLiveEvent'
import { MESSAGES } from '@/components/app/userActionLiveEvent/constants'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

export function UserActionLiveEventSkeleton({ slug }: UserActionLiveEventProps) {
  return (
    <UserActionFormLayout>
      <UserActionFormLayout.Container>
        <div className="flex h-full  flex-col items-center justify-center gap-4">
          <UserActionFormLayout.HeadingSkeleton
            subtitle={MESSAGES[slug]['signedOutSubtitle']}
            title={MESSAGES[slug].title}
          />
          <Skeleton>
            <Button>{'Sign in to claim'}</Button>
          </Skeleton>
        </div>
      </UserActionFormLayout.Container>
    </UserActionFormLayout>
  )
}
