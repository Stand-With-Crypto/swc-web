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
  label: string
  onSign?: () => void
  isClosed?: boolean
  isSigned?: boolean
}

export function SignaturesSummary({
  signatures,
  goal,
  locale,
  label,
  onSign,
  isClosed,
  isSigned,
}: SignaturesSummaryProps) {
  const percentage = Math.min((signatures / goal) * 100, 100)
  const formattedSignatures = <FormattedNumber amount={signatures} locale={locale} />
  const formattedGoalString = compactNumber(goal, locale)

  const hasReachedGoal = signatures >= goal

  return (
    <div className="flex w-full flex-col items-center justify-center gap-6 rounded-3xl bg-gray-100 px-14 py-10">
      {/* this is just to fit the size of the card when the goal is reached */}
      <div className={cn({ '-mb-2': hasReachedGoal })}>
        {hasReachedGoal && <p className="text-center font-medium text-foreground">Goal reached!</p>}
        <h2 className="text-3xl font-bold text-foreground">{formattedSignatures} Signed</h2>
      </div>

      <div className="flex flex-col items-center gap-2 lg:gap-4">
        <CircularProgress
          color="#6100FF"
          gapDegrees={60}
          label="Signature Goal"
          percentage={percentage}
          size={200}
          strokeWidth={20}
          value={formattedGoalString}
        />
        <p className="text-center font-medium text-muted-foreground">{label}</p>
      </div>

      <PetitionSummaryFooter isClosed={isClosed} isSigned={isSigned} onSign={onSign} />
    </div>
  )
}
