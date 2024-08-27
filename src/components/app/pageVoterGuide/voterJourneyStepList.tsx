'use client'

import { VOTER_GUIDE_STEPS } from '@/components/app/pageVoterGuide/constants'
import { VoterJourneyStepCard } from '@/components/app/pageVoterGuide/voterJourneyStepCard'
import { useApiResponseForUserPerformedUserActionTypes } from '@/hooks/useApiResponseForUserPerformedUserActionTypes'
import { cn } from '@/utils/web/cn'
import { UserActionType } from '@prisma/client'
import { ClassValue } from 'clsx'

interface VoterJourneyStepListProps {
  className?: ClassValue
}

export const VoterJourneyStepList = (props: VoterJourneyStepListProps) => {
  const { className } = props

  const performedActions = useApiResponseForUserPerformedUserActionTypes()

  const getStepStatus = (action: UserActionType, campaignName: string) => {
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

  return (
    <div className={cn('space-y-4', className)}>
      {VOTER_GUIDE_STEPS.map(({ WrapperComponent, ...stepProps }, index) => (
        <WrapperComponent key={index}>
          <div>
            <VoterJourneyStepCard
              step={index + 1}
              title={stepProps.title}
              description={stepProps.description}
              status={getStepStatus(stepProps.action, stepProps.campaignName)}
            />
          </div>
        </WrapperComponent>
      ))}
    </div>
  )
}
