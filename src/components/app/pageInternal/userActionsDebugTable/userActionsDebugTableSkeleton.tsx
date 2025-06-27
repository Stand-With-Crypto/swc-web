import { Skeleton } from '@/components/ui/skeleton'

export function UserActionsDebugTableSkeleton() {
  return (
    <div className="space-y-4">
      <div className="h-10 w-full">
        <Skeleton className="h-full w-full" />
      </div>
      {Array.from({ length: 5 }).map((_, i) => (
        <div className="flex space-x-4" key={i}>
          <Skeleton className="h-8 flex-1" />
          <Skeleton className="h-8 flex-1" />
          <Skeleton className="h-8 flex-1" />
          <Skeleton className="h-8 flex-1" />
          <Skeleton className="h-8 flex-1" />
        </div>
      ))}
    </div>
  )
}
