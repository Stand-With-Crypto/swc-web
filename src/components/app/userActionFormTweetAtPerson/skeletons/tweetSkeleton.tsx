import { Skeleton } from '@/components/ui/skeleton'

export function TweetAtPersonSectionSkeleton() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4">
      <Skeleton className="h-20 w-full" />

      <Skeleton className="h-40 w-full lg:max-w-[600px]" />

      <Skeleton className="h-60 w-full lg:max-w-[600px]" />

      <Skeleton className="mt-auto h-20 w-full lg:max-w-[200px]" />
    </div>
  )
}
