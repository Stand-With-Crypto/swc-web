import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import { usePreventOverscroll } from '@/hooks/usePreventOverscroll'

export function EventDialogContentSkeleton() {
  usePreventOverscroll()

  return (
    <div className="flex h-full flex-col">
      <ScrollArea className="overflow-auto px-4 py-6 md:max-h-[70vh]">
        <div className="flex h-full flex-col items-center gap-4">
          <Skeleton className="h-24 w-24" />

          <Skeleton className="h-24 w-full" />

          <Skeleton className="h-6 w-60" />

          <Skeleton className="h-6 w-60" />

          <Skeleton className="h-96 w-full" />

          <Skeleton className="h-6 w-60" />
        </div>
      </ScrollArea>
    </div>
  )
}
