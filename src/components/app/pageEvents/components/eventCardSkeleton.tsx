import { Skeleton } from '@/components/ui/skeleton'

export function EventCardSkeleton() {
  return (
    <div className="flex w-full max-w-[856px] flex-col items-start justify-between gap-2 rounded-2xl bg-backgroundAlternate py-4 pl-6 pr-10 lg:flex-row lg:items-center">
      <Skeleton className="mb-2 h-[70px] w-[70px] bg-slate-300 lg:hidden" />
      <Skeleton className="h-7 w-full bg-slate-300 lg:hidden lg:max-w-28" />

      <div className="hidden w-full items-center gap-4 lg:flex">
        <Skeleton className="mb-2 h-[70px] w-[70px] bg-slate-300" />
        <Skeleton className="h-7 w-full bg-slate-300 lg:max-w-80" />
      </div>

      <Skeleton className="h-4 w-20 bg-slate-300 lg:hidden" />

      <div className="hidden flex-col items-end gap-2 lg:flex">
        <Skeleton className="h-4 w-24 bg-slate-300" />
        <Skeleton className="h-4 w-20 bg-slate-300" />
      </div>
    </div>
  )
}
