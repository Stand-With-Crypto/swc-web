'use client'

import { useMemo } from 'react'

import { useUserAddress } from '@/components/app/pageReferrals/common/userAddress.context'
import { AnimatedNumericOdometer } from '@/components/ui/animatedNumericOdometer'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/utils/web/cn'

interface UserLocationRankingProps {
  finishProfileText: string
  label: string
  notFoundText?: string
  className?: string
}

export function UserLocationRanking({
  finishProfileText,
  label,
  notFoundText = 'N/A',
  className,
}: UserLocationRankingProps) {
  const { address, isLoading, electoralZone, electoralZoneRanking } = useUserAddress()

  const districtRanking = useMemo(() => {
    if (isLoading) {
      return <Skeleton className={cn('h-12 w-14 bg-primary-cta/10', className)} />
    }

    if (!address?.description) {
      return <p>{finishProfileText}</p>
    }

    if (!electoralZoneRanking?.rank || !electoralZone) {
      return <p className="text-3xl font-bold">{notFoundText}</p>
    }

    return (
      <div className="flex gap-1">
        <span className="text-4xl font-semibold">#</span>
        <AnimatedNumericOdometer
          className="justify-start"
          size={48}
          value={electoralZoneRanking?.rank?.toString() ?? '0'}
        />
      </div>
    )
  }, [
    address?.description,
    electoralZoneRanking,
    electoralZone,
    isLoading,
    finishProfileText,
    notFoundText,
    className,
  ])

  return (
    <div
      className={cn(
        'flex w-full flex-col items-start justify-between gap-10 rounded-2xl bg-secondary p-4',
        className,
      )}
    >
      <p className="font-medium">{label}</p>
      {districtRanking}
    </div>
  )
}
