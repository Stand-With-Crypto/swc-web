import React, { useCallback, useMemo } from 'react'

import { useSignature } from '@/components/app/pagePetitionDetails/signatureContext'
import { compactNumber } from '@/utils/shared/compactNumber'
import { SupportedLocale } from '@/utils/shared/supportedLocales'

import { MilestoneItem } from './item'

interface Milestone {
  label: string
  isComplete: boolean
}

interface PetitionMilestonesProps {
  goal: number
  shouldGenerateAutomaticMilestones: boolean
  additionalMilestones: Milestone[]
  locale?: SupportedLocale
}

const AUTOMATIC_MILESTONES_THRESHOLDS = [10, 25, 50, 100]

export function PetitionMilestones({
  goal,
  shouldGenerateAutomaticMilestones,
  additionalMilestones,
  locale = SupportedLocale.EN_US,
}: PetitionMilestonesProps) {
  const { optimisticSignatureCount } = useSignature()

  const generateAutomaticMilestones = useCallback((): Milestone[] => {
    if (!shouldGenerateAutomaticMilestones) {
      return []
    }

    return AUTOMATIC_MILESTONES_THRESHOLDS.map(percentage => {
      const targetSignatures = Math.ceil((goal * percentage) / 100)
      const isComplete = optimisticSignatureCount >= targetSignatures

      return {
        label: `${compactNumber(targetSignatures, locale)} Signatures`,
        isComplete,
      }
    })
  }, [goal, shouldGenerateAutomaticMilestones, optimisticSignatureCount, locale])

  const automaticMilestones = generateAutomaticMilestones()

  const allMilestones = useMemo(
    // Reverse the milestones to show the latest on top and the earliest/simplest at the bottom
    () => [...automaticMilestones, ...additionalMilestones].reverse(),
    [automaticMilestones, additionalMilestones],
  )

  if (allMilestones.length === 0) {
    return null
  }

  return (
    <div className="space-y-4">
      <h3 className="text-3xl font-bold text-foreground">Petition Milestones</h3>
      <div className="space-y-2">
        {allMilestones.map((milestone, index) => (
          <MilestoneItem
            isComplete={milestone.isComplete}
            key={`${milestone.label}-${index}`}
            label={milestone.label}
          />
        ))}
      </div>
    </div>
  )
}
