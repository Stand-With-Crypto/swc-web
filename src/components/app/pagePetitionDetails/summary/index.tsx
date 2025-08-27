import React from 'react'
import { GoalIcon } from 'lucide-react'

import { PetitionSummaryFooter } from '@/components/app/pagePetitionDetails/summary/footer'
import { CircularProgress } from '@/components/ui/circularProgress'
import { FormattedNumber } from '@/components/ui/formattedNumber'
import { compactNumber } from '@/utils/shared/compactNumber'
import { SupportedLocale } from '@/utils/shared/supportedLocales'
import { cn } from '@/utils/web/cn'

interface SignaturesSummaryProps {
  signatures: number
  goal: number
  locale: SupportedLocale
  label?: string
  onSign?: () => void
  isClosed?: boolean
  isSigned?: boolean
  className?: string
  petitionSlug?: string
}

export function SignaturesSummary({
  signatures,
  goal,
  locale,
  label,
  onSign,
  isClosed,
  isSigned,
  className,
  petitionSlug,
}: SignaturesSummaryProps) {
  const percentage = Math.min((signatures / goal) * 100, 100)
  const formattedGoalString = compactNumber(goal, locale)

  const hasReachedGoal = signatures >= goal

  return (
    <div className={cn('flex w-full items-center rounded-3xl bg-muted', className)}>
      {/* Desktop */}
      <div className="flex w-full flex-col items-center justify-center gap-6 px-14 py-10 max-lg:hidden">
        <div className={cn({ 'lg:-mb-2': hasReachedGoal })}>
          <h2 className="text-3xl font-bold text-foreground">
            <FormattedNumber amount={signatures} locale={locale} /> Signed
          </h2>
        </div>

        <div className="flex flex-col items-center gap-2 lg:gap-4">
          <CircularProgress percentage={percentage}>
            {hasReachedGoal && <GoalIcon size={24} />}
            <h3 className="text-2xl font-bold">{formattedGoalString}</h3>
            <p className="text-sm font-medium text-muted-foreground">
              {hasReachedGoal ? <span className="font-bold">Goal reached!</span> : 'Signature goal'}
            </p>
          </CircularProgress>
          {label && <p className="text-center font-medium text-muted-foreground">{label}</p>}
        </div>

        <PetitionSummaryFooter
          isClosed={isClosed}
          isSigned={isSigned}
          onSign={onSign}
          petitionSlug={petitionSlug}
        />
      </div>

      {/* Mobile */}
      <div className="flex w-full items-center justify-between gap-3 p-4 lg:hidden">
        <div className="flex items-center gap-3">
          {hasReachedGoal ? (
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-cta">
              <GoalIcon className="text-white" size={24} />
            </div>
          ) : (
            <CircularProgress percentage={percentage} size={40} strokeWidth={8} />
          )}
          <div className="flex flex-col">
            <p className="text-lg font-bold">
              <FormattedNumber amount={signatures} locale={locale} /> Signed
            </p>
            <p className="text-sm font-medium text-muted-foreground">
              {compactNumber(goal, locale)} {hasReachedGoal ? 'Goal reached!' : 'Signature goal'}
            </p>
          </div>
        </div>
        <PetitionSummaryFooter
          isClosed={isClosed}
          isSigned={isSigned}
          onSign={onSign}
          petitionSlug={petitionSlug}
        />
      </div>
    </div>
  )
}
