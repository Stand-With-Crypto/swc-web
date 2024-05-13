import { Button } from '@/components/ui/button'
import { dialogContentPaddingStyles } from '@/components/ui/dialog/styles'
import { PageSubTitle } from '@/components/ui/pageSubTitle'
import { PageTitle } from '@/components/ui/pageTitleText'
import { Skeleton } from '@/components/ui/skeleton'

export const dynamic = 'error'

export default function LoadingState() {
  return (
    <div className={dialogContentPaddingStyles}>
      <div className="space-y-6 text-center">
        <PageTitle size="sm">
          <Skeleton>What is a 501(c)4 and what does it mean to become a member?</Skeleton>
        </PageTitle>
        <PageSubTitle size={'md'}>
          <Skeleton>
            A 501(c)4 is a type of nonprofit - in our case, a nonprofit that acts as a pro-crypto
            advocacy group. Some benefits of joining Stand With Crypto as a 501(c)4 member include:
          </Skeleton>
        </PageSubTitle>
        <div className="mt-4 list-disc text-left text-fontcolor-muted">
          <Skeleton>
            Receiving in-depth member-exclusive analyses on upcoming elections that impact the
            future of crypto in America
            <br />
            Making your voice heard and ensure Stand With Crypto will advocate for issues you care
            about
            <br />
            Joining a group of like-minded individuals to form the largest pro-crypto organization
            in the US
          </Skeleton>
        </div>
      </div>
      <div className="mt-12 flex items-center justify-center">
        <Button variant="secondary">
          <Skeleton>Join Stand With Crypto</Skeleton>
        </Button>
      </div>
    </div>
  )
}
