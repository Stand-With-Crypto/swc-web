import { UserActionFormLayout } from '@/components/app/userActionFormCommon'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

export function UserActionFormLiveEventSkeleton() {
  return (
    <UserActionFormLayout>
      <UserActionFormLayout.Container>
        <div className="flex h-full  flex-col items-center justify-center gap-4">
          <UserActionFormLayout.HeadingSkeleton subtitle="dummy title" title="dummy subtitle" />
          <Skeleton>
            <Button>Sign in to claim</Button>
          </Skeleton>
        </div>
      </UserActionFormLayout.Container>
    </UserActionFormLayout>
  )
}
