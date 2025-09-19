import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import { usePreventOverscroll } from '@/hooks/usePreventOverscroll'

export function StateEventsDialogContentSkeleton() {
  usePreventOverscroll()

  return (
    <div className="flex flex-col items-center gap-2 pb-4">
      <Skeleton className="h-24 w-24" />

      <Skeleton className="h-6 w-60" />
      <Skeleton className="h-24 w-full" />

      <ScrollArea className="w-full">
        <div className="flex w-full max-w-[856px] flex-col gap-4 rounded-2xl bg-backgroundAlternate p-6 pt-4 transition hover:bg-backgroundAlternate/60 lg:flex-row lg:items-center lg:p-4 lg:pt-4">
          <Skeleton className="h-20 w-20" />
          <Skeleton className="h-6 w-60" />
        </div>
        <ScrollBar />
      </ScrollArea>
    </div>
  )
}
