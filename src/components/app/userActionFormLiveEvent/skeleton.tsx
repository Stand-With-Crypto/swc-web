import { UserActionFormLayout } from '@/components/app/userActionFormCommon'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

const NFT_IMAGE_SIZE_PX = 160

export function UserActionFormLiveEventSkeleton() {
  return (
    <UserActionFormLayout>
      <UserActionFormLayout.Container>
        <div className="flex h-full  flex-col items-center justify-center gap-4">
          <Skeleton className={`h-[${NFT_IMAGE_SIZE_PX}px] w-[${NFT_IMAGE_SIZE_PX}px]`} />
          <UserActionFormLayout.HeadingSkeleton subtitle="dummy title" title="dummy subtitle" />
          <Skeleton>
            <Button>Continue</Button>
          </Skeleton>
        </div>
      </UserActionFormLayout.Container>
    </UserActionFormLayout>
  )
}
