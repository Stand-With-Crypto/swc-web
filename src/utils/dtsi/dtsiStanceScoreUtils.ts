import { isNil } from 'lodash-es'

import { DTSI_Person } from '@/data/dtsi/generated'
import { twNoop } from '@/utils/web/cn'

export enum DTSILetterGrade {
  A = 'A',
  B = 'B',
  C = 'C',
  D = 'D',
  F = 'F',
}

type PersonWithStanceScore = Pick<
  DTSI_Person,
  'computedStanceScore' | 'manuallyOverriddenStanceScore' | 'computedSumStanceScoreWeight'
>

const getScore = (item: PersonWithStanceScore) =>
  item.manuallyOverriddenStanceScore ?? item.computedStanceScore

export const convertDTSIPersonStanceScoreToLetterGrade = (entity: PersonWithStanceScore) => {
  const score = getScore(entity)
  if (isNil(score)) {
    return null
  }
  if (score >= 90) {
    return DTSILetterGrade.A
  }
  if (score >= 70) {
    return DTSILetterGrade.B
  }
  if (score >= 50) {
    return DTSILetterGrade.C
  }
  if (score >= 30) {
    return DTSILetterGrade.D
  }
  return DTSILetterGrade.F
}

export const convertDTSIPersonStanceScoreToCryptoSupportLanguage = (
  entity: PersonWithStanceScore,
) => {
  const score = getScore(entity)
  if (isNil(score)) {
    if (!entity.computedSumStanceScoreWeight) {
      return 'No Stance'
    }
    return 'Not Enough Information'
  }
  if (score >= 90) {
    return 'Strongly Supportive'
  }
  if (score >= 70) {
    return 'Somewhat Supportive'
  }
  if (score >= 50) {
    return 'Neutral'
  }
  if (score >= 30) {
    return 'Somewhat Against'
  }
  return 'Strongly against'
}

export const convertDTSIPersonStanceScoreToCryptoSupportLanguageSentence = (
  entity: PersonWithStanceScore,
) => {
  const score = getScore(entity)
  if (isNil(score)) {
    if (!entity.computedSumStanceScoreWeight) {
      return 'No stance on crypto'
    }
    return 'Not enough information'
  }
  if (score >= 90) {
    return 'Strongly supports crypto'
  }
  if (score >= 70) {
    return 'Somewhat supports crypto'
  }
  if (score >= 50) {
    return 'Neutral on crypto'
  }
  if (score >= 30) {
    return 'Somewhat against crypto'
  }
  return 'Strongly against crypto'
}

export const convertDTSIStanceScoreToCryptoSupportLanguage = (score: number | null | undefined) => {
  if (isNil(score)) {
    return 'Pending Analysis'
  }
  if (score > 75) {
    return 'Very pro-crypto'
  }
  if (score > 50) {
    return 'Somewhat pro-crypto'
  }
  if (score === 50) {
    return 'Neutral on crypto'
  }
  if (score >= 25) {
    return 'Somewhat anti-crypto'
  }
  return 'Very anti-crypto'
}

export const convertDTSIStanceScoreToTextColorClass = (score: number | null | undefined) => {
  if (isNil(score)) {
    return twNoop('text-gray-700')
  }
  if (score > 50) {
    return twNoop('text-green-700')
  }
  if (score === 50) {
    return twNoop('text-gray-700')
  }
  return twNoop('text-red-700')
}

export const convertDTSIStanceScoreToBgColorClass = (score: number | null | undefined) => {
  if (isNil(score)) {
    return twNoop('bg-gray-200')
  }
  if (score > 50) {
    return twNoop('bg-green-200')
  }
  if (score === 50) {
    return twNoop('bg-gray-200')
  }
  return twNoop('bg-red-200')
}
