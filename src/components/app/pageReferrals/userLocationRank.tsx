'use client'

import { AnimatedNumericOdometer } from '@/components/ui/animatedNumericOdometer'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/utils/web/cn'

export function UserLocationRank({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}

function UserLocationSkeleton({ className }: { className?: string }) {
  return <Skeleton className={cn('h-12 w-14 bg-primary-cta/10', className)} />
}

function UserLocationRankOdometer({ rank }: { rank: number }) {
  return (
    <div className="flex gap-1">
      <span className="text-4xl font-semibold">#</span>
      <AnimatedNumericOdometer className="justify-start" size={48} value={rank.toString()} />
    </div>
  )
}

function UserLocationRankWrapper({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        'flex w-full flex-col items-start justify-between gap-10 rounded-2xl bg-secondary p-4',
        className,
      )}
    >
      {children}
    </div>
  )
}

function UserLocationRankLabel({ children }: { children: React.ReactNode }) {
  return <p className="font-medium">{children}</p>
}

UserLocationRank.Skeleton = UserLocationSkeleton
UserLocationRank.RankOdometer = UserLocationRankOdometer
UserLocationRank.Wrapper = UserLocationRankWrapper
UserLocationRank.Label = UserLocationRankLabel
