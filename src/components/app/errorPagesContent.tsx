import { Button } from '@/components/ui/button'
import { MaybeNextImg } from '@/components/ui/image'
import { PageTitle } from '@/components/ui/pageTitleText'

export function ErrorPagesContent({ reset }: { reset: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center gap-6">
      <MaybeNextImg src="/error_shield.svg" width={120} height={120} alt="" />
      <PageTitle>Something went wrong.</PageTitle>
      <Button className="mr-3" onClick={reset}>
        Try again
      </Button>
    </div>
  )
}
