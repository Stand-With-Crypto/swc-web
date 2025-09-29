'use client'

import React, { useCallback, useMemo } from 'react'

import { useSignature } from '@/components/app/pagePetitionDetails/common/signatureContext'
import { compactNumber } from '@/utils/shared/compactNumber'
import { createI18nMessages } from '@/utils/shared/i18n/createI18nMessages'
import { getLocaleForLanguage } from '@/utils/shared/i18n/interpolationUtils'
import { SupportedLocale } from '@/utils/shared/supportedLocales'
import { useLanguage } from '@/utils/web/i18n/useLanguage'
import { useTranslation } from '@/utils/web/i18n/useTranslation'

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

export const i18nMessages = createI18nMessages({
  defaultMessages: {
    en: {
      petitionMilestones: 'Petition Milestones',
      signatures: 'Signatures',
    },
    de: {
      petitionMilestones: 'Petitionsmeilensteine',
      signatures: 'Unterschriften',
    },
    fr: {
      petitionMilestones: 'Étapes clés de la pétition',
      signatures: 'Signatures',
    },
  },
})

export function PetitionMilestones({
  goal,
  shouldGenerateAutomaticMilestones,
  additionalMilestones,
  locale: overrideLocale = SupportedLocale.EN_US,
}: PetitionMilestonesProps) {
  const { t } = useTranslation(i18nMessages, 'PetitionMilestones')
  const language = useLanguage()

  const locale = overrideLocale || getLocaleForLanguage(language)

  const { optimisticSignatureCount } = useSignature()

  const generateAutomaticMilestones = useCallback((): Milestone[] => {
    if (!shouldGenerateAutomaticMilestones) {
      return []
    }

    return AUTOMATIC_MILESTONES_THRESHOLDS.map(percentage => {
      const targetSignatures = Math.ceil((goal * percentage) / 100)
      const isComplete = optimisticSignatureCount >= targetSignatures

      return {
        label: `${compactNumber(targetSignatures, locale)} ${t('signatures')}`,
        isComplete,
      }
    })
  }, [goal, shouldGenerateAutomaticMilestones, optimisticSignatureCount, locale, t])

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
      <h3 className="text-3xl font-bold text-foreground">{t('petitionMilestones')}</h3>
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
