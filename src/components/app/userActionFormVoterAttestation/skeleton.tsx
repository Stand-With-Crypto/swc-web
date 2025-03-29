import { IntroStaticContent } from '@/components/app/userActionFormVoterAttestation/sections/intro'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

export function UserActionFormVoterAttestationSkeleton() {
  return (
    <IntroStaticContent
      nftDisplay={
        <Skeleton
          className={'mx-auto h-56 w-full max-w-96 overflow-hidden rounded-xl object-cover'}
        />
      }
    >
      <Button className="w-full" disabled>
        Loading...
      </Button>
    </IntroStaticContent>
  )
}
