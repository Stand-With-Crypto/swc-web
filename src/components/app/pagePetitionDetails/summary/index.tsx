'use client'

import React, { useCallback, useMemo, useState } from 'react'
import { UserActionType } from '@prisma/client'
import { GoalIcon } from 'lucide-react'

import { PetitionSummaryFooter } from '@/components/app/pagePetitionDetails/summary/footer'
import { AnimatedNumericOdometer } from '@/components/ui/animatedNumericOdometer'
import { CircularProgress } from '@/components/ui/circularProgress'
import { useApiResponseForUserFullProfileInfo } from '@/hooks/useApiResponseForUserFullProfileInfo'
import { compactNumber } from '@/utils/shared/compactNumber'
import { COUNTRY_CODE_TO_LOCALE, SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { SupportedLocale } from '@/utils/shared/supportedLocales'
import { cn } from '@/utils/web/cn'

interface SignaturesSummaryProps {
  signatures: number
  goal: number
  countryCode: SupportedCountryCodes
  locale: SupportedLocale
  label?: string
  isClosed?: boolean
  isSigned?: boolean
  className?: string
  petitionSlug?: string
}

export function SignaturesSummary({
  signatures,
  goal,
  countryCode,
  locale,
  label,
  isClosed,
  className,
  petitionSlug,
}: SignaturesSummaryProps) {
  const { data: userData, isLoading: isLoadingUser } = useApiResponseForUserFullProfileInfo()
  const [isOptimisticSigned, setIsOptimisticSigned] = useState(false)

  const isSigned = useMemo(() => {
    return (
      userData?.user?.userActions?.some(
        userAction =>
          userAction.actionType === UserActionType.SIGN_PETITION &&
          userAction.campaignName === petitionSlug,
      ) || isOptimisticSigned
    )
  }, [userData?.user?.userActions, petitionSlug, isOptimisticSigned])

  const isLoading = useMemo(() => {
    return isLoadingUser || !userData?.user?.userActions
  }, [isLoadingUser, userData?.user?.userActions])

  const optimisticSignatures = isSigned ? signatures + 1 : signatures

  const percentage = Math.min((optimisticSignatures / goal) * 100, 100)
  const formattedGoalString = compactNumber(goal, locale)
  const hasReachedGoal = optimisticSignatures >= goal

  const formattedSignatures = new Intl.NumberFormat(COUNTRY_CODE_TO_LOCALE[countryCode]).format(
    optimisticSignatures,
  )

  const handlePetitionSigned = useCallback(() => {
    setIsOptimisticSigned(true)
  }, [])

  return (
    <div className={cn('flex w-full items-center rounded-3xl bg-muted', className)}>
      {/* Desktop */}
      <div className="flex w-full flex-col items-center justify-center gap-6 px-14 py-10 max-lg:hidden">
        <div>
          <h2 className="flex items-center gap-2 text-3xl font-bold text-foreground">
            <AnimatedNumericOdometer
              as="span"
              className="text-3xl font-bold"
              numberSpanClassName="flex items-center"
              size={38}
              value={formattedSignatures}
            />
            <span>Signed</span>
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
          countryCode={countryCode}
          isClosed={isClosed}
          isLoading={isLoading}
          isSigned={isSigned}
          onPetitionSigned={handlePetitionSigned}
          petitionSlug={petitionSlug}
        />
      </div>

      {/* Mobile */}
      <div className="flex w-full items-center justify-between gap-3 p-4 lg:hidden">
        <div className="flex items-center gap-3">
          {hasReachedGoal ? (
            <div className="flex h-10 w-10 animate-bubble items-center justify-center rounded-full bg-primary-cta delay-200">
              <GoalIcon className="text-white" size={24} />
            </div>
          ) : (
            <CircularProgress percentage={percentage} size={40} strokeWidth={8} />
          )}
          <div className="flex flex-col">
            <p className="flex items-center gap-1 text-lg font-bold">
              <AnimatedNumericOdometer
                as="span"
                className="text-lg font-bold"
                numberSpanClassName="flex items-center"
                size={22}
                value={formattedSignatures}
              />
              <span>Signed</span>
            </p>
            <p className="text-sm font-medium text-muted-foreground">
              {compactNumber(goal, locale)} {hasReachedGoal ? 'Goal reached!' : 'Signature goal'}
            </p>
          </div>
        </div>
        <PetitionSummaryFooter
          countryCode={countryCode}
          isClosed={isClosed}
          isLoading={isLoading}
          isSigned={isSigned}
          onPetitionSigned={handlePetitionSigned}
          petitionSlug={petitionSlug}
        />
      </div>
    </div>
  )
}
