import { UserActionRowCTAsList } from '@/components/app/userActionRowCTA/userActionRowCTAsList'
import { Button } from '@/components/ui/button'
import { PageSubTitle } from '@/components/ui/pageSubTitle'
import { PageTitle } from '@/components/ui/pageTitleText'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { PageProps } from '@/types'
import { generateMetadataDetails } from '@/utils/server/metadataUtils'
import { Metadata } from 'next'

export const dynamic = 'error'

type Props = PageProps

const title = 'Your Stand With Crypto profile'
const description = `See what actions you can take to help promote innovation.`
export async function generateMetadata(_props: Props): Promise<Metadata> {
  return generateMetadataDetails({
    title,
    description,
  })
}

export default function Profile({ params }: Props) {
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
          <Button>
            <Skeleton>Finish your profile</Skeleton>
          </Button>
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
      <PageTitle withoutBalancer className="mb-4">
        <Skeleton>Your advocacy progress</Skeleton>
      </PageTitle>
      <PageSubTitle withoutBalancer className="mb-5">
        <Skeleton>
          You've completed {0} out of {6} actions. Keep going!
        </Skeleton>
      </PageSubTitle>
      <div className="mx-auto mb-5 max-w-xl">
        <Progress value={0} />
      </div>
      <UserActionRowCTAsList performedUserActionTypes={[]} className="mb-14" />
    </div>
  )
}
