import { UserActionGridCTAsSkeleton } from '@/components/app/userActionGridCTAs/skeleton'
import { Button } from '@/components/ui/button'
import { PageSubTitle } from '@/components/ui/pageSubTitle'
import { PageTitle } from '@/components/ui/pageTitleText'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'

import type { PageUserProfileProps } from '.'

export function PageUserProfileSkeleton({
  hideUserMetrics = false,
}: Pick<PageUserProfileProps, 'hideUserMetrics'>) {
  return (
    <div className="standard-spacing-from-navbar container">
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
      {!hideUserMetrics && (
        <div className="mb-14 grid grid-cols-4 rounded-lg bg-secondary p-3 text-center sm:p-6">
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
      )}

      <section>
        <Skeleton>
          <PageTitle className="mb-4" size="md">
            Your advocacy progress
          </PageTitle>
        </Skeleton>

        <Skeleton>
          <PageSubTitle className="mb-5">
            You've completed {0} out of {6} actions. Keep going!
          </PageSubTitle>
        </Skeleton>
        <div className="mx-auto mb-10 max-w-xl">
          <Progress value={0} />
        </div>
      </section>
      <UserActionGridCTAsSkeleton />
    </div>
  )
}
