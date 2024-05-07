import { PageTitle } from '@/components/ui/pageTitleText'
import { Skeleton } from '@/components/ui/skeleton'

export function ProfileInfoSkeleton() {
  return (
    <div className="flex h-full flex-col">
      <PageTitle size="md" withoutBalancer>
        Fight to keep crypto in America
      </PageTitle>

      <p className="mb-2 mt-4 text-center text-muted-foreground lg:my-8">
        Join a community of over 400,000 people fighting to keep crypto in America. Get updates on
        crypto policy and local events.
      </p>

      <div className="my-4 flex w-full flex-col gap-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>

      <div className="mt-auto flex w-full flex-col gap-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-20 w-full" />
      </div>
    </div>
  )
}
