'use client'

import { useMemo } from 'react'
import { UserActionType } from '@prisma/client'
import { ClassValue } from 'clsx'

import { getVoterGuideCTAsByCountry } from '@/components/app/pageVoterGuide/constants/ctas'
import { CheckIcon } from '@/components/app/userActionGridCTAs/icons/checkIcon'
import { NextImage } from '@/components/ui/image'
import { useApiResponseForUserPerformedUserActionTypes } from '@/hooks/useApiResponseForUserPerformedUserActionTypes'
import { useCountryCode } from '@/hooks/useCountryCode'
import { cn } from '@/utils/web/cn'

interface VoterJourneyStepListProps {
  className?: ClassValue
}

const getStepStatus = (
  action: UserActionType,
  campaignName: string,
  performedActions: Awaited<ReturnType<typeof useApiResponseForUserPerformedUserActionTypes>>,
) => {
  if (performedActions?.isLoading) {
    return 'unknown'
  }

  return performedActions?.data?.performedUserActionTypes?.some(
    performedAction =>
      performedAction.actionType === action && performedAction.campaignName === campaignName,
  )
    ? 'complete'
    : 'incomplete'
}

export function VoterJourneyStepList({ className }: VoterJourneyStepListProps) {
  const userCountryCode = useCountryCode()
  const performedActions = useApiResponseForUserPerformedUserActionTypes()

  const hydratedSteps = useMemo(
    () =>
      getVoterGuideCTAsByCountry(userCountryCode).map(step => ({
        ...step,
        status: getStepStatus(step.action, step.campaignName, performedActions),
      })),
    [performedActions, userCountryCode],
  )

  const gridColumnsClassName = useMemo(() => {
    return `lg:grid-cols-${hydratedSteps.length}`
  }, [hydratedSteps])

  return (
    <div className={cn(`grid grid-cols-1 gap-[18px] ${gridColumnsClassName}`, className)}>
      {hydratedSteps.map(({ WrapperComponent, status, ...stepProps }, index) => (
        <WrapperComponent countryCode={userCountryCode} key={index}>
          <button
            className={cn(
              'flex h-full w-full cursor-pointer flex-row-reverse justify-self-center rounded-3xl transition-shadow hover:shadow-lg lg:max-w-96 lg:flex-col',
            )}
          >
            <div className="flex h-full min-h-32 min-w-32 max-w-32 items-center justify-center rounded-br-3xl rounded-tr-3xl bg-[radial-gradient(74.32%_74.32%_at_50.00%_50.00%,#F0E8FF_8.5%,#6B28FF_89%)] px-5 py-9 lg:h-auto lg:min-h-48 lg:w-full lg:max-w-full lg:rounded-br-none lg:rounded-tl-3xl">
              <NextImage
                alt={stepProps.title}
                className="hidden lg:block"
                height={150}
                src={stepProps.image}
                width={stepProps.wideDesktopImage ? 180 : 150}
              />
              <NextImage
                alt={stepProps.title}
                className="h-20 w-20 lg:hidden"
                height={80}
                src={stepProps.mobileImage ?? stepProps.image}
                width={80}
              />
            </div>
            <div className="flex h-full w-full flex-col items-start justify-between gap-3 rounded-bl-3xl rounded-tl-3xl bg-muted px-4 py-4 lg:rounded-br-3xl lg:rounded-tl-none lg:p-6">
              <strong className="text-left font-sans text-sm font-bold lg:text-xl">
                {stepProps.title}
              </strong>
              <p className="hidden text-left text-sm text-muted-foreground lg:block lg:text-base">
                {stepProps.description}
              </p>
              <p className="text-left text-sm text-muted-foreground lg:hidden lg:text-base">
                {stepProps.description}
              </p>

              <div className="mt-auto flex items-center gap-4 pt-5">
                <div className="relative h-8 w-6">
                  <CheckIcon
                    completed={status === 'complete'}
                    svgClassname="border-2 border-muted bg-muted"
                  />
                </div>
                <span className="text-xs lg:text-base">
                  {status === 'complete' ? 'Complete' : 'Not complete'}
                </span>
              </div>
            </div>
          </button>
        </WrapperComponent>
      ))}
    </div>
  )
}
