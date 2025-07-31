'use client'

import { useMemo } from 'react'
import { UserActionType } from '@prisma/client'

import { AnimatedNumericOdometer } from '@/components/ui/animatedNumericOdometer'
import { Skeleton } from '@/components/ui/skeleton'
import { useApiResponseForUserFullProfileInfo } from '@/hooks/useApiResponseForUserFullProfileInfo'
import { useHasHydrated } from '@/hooks/useHasHydrated'
import { useSession } from '@/hooks/useSession'
import { cn } from '@/utils/web/cn'

interface ReferralsCounterProps {
  children: React.ReactNode
  className?: string
}

export function ReferralsCounter(props: ReferralsCounterProps) {
  const { children, className } = props

  const { isLoggedIn, isLoading } = useSession()
  const hasHydrated = useHasHydrated()

  if (!isLoggedIn || isLoading || !hasHydrated) {
    return null
  }

  return <div className={cn('flex w-full gap-4', className)}>{children}</div>
}

export function UserCounterWrapper({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        'flex w-full flex-col items-start justify-between gap-10 rounded-2xl bg-primary-cta p-4 text-white',
        className,
      )}
    >
      {children}
    </div>
  )
}

export function UserReferralsCount({ className }: { className?: string }) {
  const userResponse = useApiResponseForUserFullProfileInfo({
    refreshInterval: 1000 * 60 * 1, // 1 minute
  })
  const user = userResponse.data?.user

  const referralsCount = useMemo(() => {
    if (!user?.userActions?.length) return 0

    return user.userActions
      .filter(action => action.actionType === UserActionType.REFER)
      .reduce((total, action) => total + (action.referralsCount || 0), 0)
  }, [user])

  return (
    <UserCounterWrapper className={className}>
      <p className="font-medium">Your referrals</p>
      {userResponse.isLoading ? (
        <Skeleton className="h-12 w-14" />
      ) : (
        <AnimatedNumericOdometer size={48} value={referralsCount.toString()} />
      )}
    </UserCounterWrapper>
  )
}

ReferralsCounter.UserReferralsCount = UserReferralsCount
