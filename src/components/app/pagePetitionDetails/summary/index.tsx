import React from 'react'

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
}: SignaturesSummaryProps) {
  const percentage = Math.min((signatures / goal) * 100, 100)
  const formattedGoalString = compactNumber(goal, locale)

  const hasReachedGoal = signatures >= goal

  return (
    <div className={cn('w-full rounded-3xl bg-gray-100', className)}>
      {/* Desktop */}
      <div className="flex w-full flex-col items-center justify-center gap-6 px-14 py-10 max-lg:hidden">
        <div className={cn({ 'lg:-mb-2': hasReachedGoal })}>
          {hasReachedGoal && (
            <p className="text-center font-medium text-foreground">Goal reached!</p>
          )}
          <h2 className="text-3xl font-bold text-foreground">
            <FormattedNumber amount={signatures} locale={locale} /> Signed
          </h2>
        </div>

        <div className="flex flex-col items-center gap-2 lg:gap-4">
          <CircularProgress
            label="Signature Goal"
            percentage={percentage}
            title={formattedGoalString}
          />
          {label && <p className="text-center font-medium text-muted-foreground">{label}</p>}
        </div>

        <PetitionSummaryFooter isClosed={isClosed} isSigned={isSigned} onSign={onSign} />
      </div>

      {/* Mobile */}
      <div className="flex items-center justify-between gap-3 p-4 lg:hidden">
        <div className="flex items-center gap-3">
          <CircularProgress percentage={percentage} size={40} strokeWidth={8} />
          <div className="flex flex-col">
            <p className="text-lg font-bold">
              <FormattedNumber amount={signatures} locale={locale} /> Signed
            </p>
            <p className="text-sm font-medium text-muted-foreground">
              {compactNumber(goal, locale)} Signature goal
            </p>
          </div>
        </div>
        <PetitionSummaryFooter isClosed={isClosed} isSigned={isSigned} onSign={onSign} />
      </div>
    </div>
  )
}
