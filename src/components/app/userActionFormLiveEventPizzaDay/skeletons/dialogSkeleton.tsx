import { Skeleton } from '@/components/ui/skeleton'

export function UserActionFormLiveEventSkeleton() {
  return (
    <div className="flex flex-col items-center justify-center pb-8">
      <Skeleton className="h-40 w-full" />

      <Skeleton className="h-14 w-full" />

      <Skeleton className="my-6 h-40 w-full" />

      <div className="align-center mb-16 flex flex-col justify-between gap-8 lg:mb-10 lg:flex-row lg:gap-14">
        <div className="flex flex-col items-center gap-4">
          <Skeleton className="h-12 w-12 rounded-full" />
          <Skeleton className="h-10 w-32" />
        </div>

        <div className="flex flex-col items-center gap-4">
          <Skeleton className="h-12 w-12 rounded-full" />
          <Skeleton className="h-10 w-32" />
        </div>

        <div className="flex flex-col items-center gap-4">
          <Skeleton className="h-12 w-12 rounded-full" />
          <Skeleton className="h-10 w-32" />
        </div>
      </div>

      <Skeleton className="h-20 w-full" />
    </div>
  )
}
