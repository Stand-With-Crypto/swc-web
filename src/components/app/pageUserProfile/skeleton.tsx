import { UserActionRowCTAsList } from '@/components/app/userActionRowCTA/userActionRowCTAsList'
import { Button } from '@/components/ui/button'
import { PageSubTitle } from '@/components/ui/pageSubTitle'
import { PageTitle } from '@/components/ui/pageTitleText'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'

export function PageUserProfileSkeleton() {
  return (
    <div className="container">
      <div className="mb-6 flex items-center justify-between md:mx-4">
        <div className="flex items-center gap-2">
          <Skeleton className="h-16 w-16" />
          <div>
            <div className="text-lg font-bold">
              <Skeleton>User name</Skeleton>
            </div>
            <div className="text-sm text-gray-500">
              <Skeleton>Joined a few days ago</Skeleton>
            </div>
          </div>
        </div>
        <div>
          <Skeleton>
            <Button>Finish your profile</Button>
          </Skeleton>
        </div>
      </div>
      <div className="mb-14 grid grid-cols-4 rounded-lg bg-blue-50 p-3 text-center sm:p-6">
        {[
          {
            label: 'Actions',
            value: 6,
          },
          {
            label: 'Donated',
            value: 100,
          },
          {
            label: 'Leaderboard',
            value: <>TODO</>,
          },
          {
            label: 'NFTs',
            value: 100,
          },
        ].map(({ label, value }) => (
          <div key={label}>
            <div className="text-xs text-gray-700 sm:text-sm md:text-base">
              <Skeleton>{label}</Skeleton>
            </div>
            <div className="text-sm font-bold sm:text-base md:text-xl">
              <Skeleton>{value}</Skeleton>
            </div>
          </div>
        ))}
      </div>
      <PageTitle className="mb-4" withoutBalancer>
        <Skeleton>Your advocacy progress</Skeleton>
      </PageTitle>
      <PageSubTitle className="mb-5" withoutBalancer>
        <Skeleton>
          You've completed {0} out of {6} actions. Keep going!
        </Skeleton>
      </PageSubTitle>
      <div className="mx-auto mb-5 max-w-xl">
        <Progress value={0} />
      </div>
      <UserActionRowCTAsList className="mb-14" />
    </div>
  )
}
