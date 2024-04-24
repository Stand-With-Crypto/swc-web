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
  'computedStanceScore' | 'manuallyOverriddenStanceScore'
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
    return 'Pending'
  }
  if (score >= 90) {
    return 'Strongly supportive'
  }
  if (score >= 70) {
    return 'Supportive'
  }
  if (score >= 50) {
    return 'Neutral'
  }
  if (score >= 30) {
    return 'Against'
  }
  return 'Strongly against'
}

export const convertDTSIPersonStanceScoreToCryptoSupportLanguageSentence = (
  entity: PersonWithStanceScore,
) => {
  const score = getScore(entity)
  if (isNil(score)) {
    return 'Pending stance on crypto'
  }
  if (score >= 90) {
    return 'Strongly supportive of crypto'
  }
  if (score >= 70) {
    return 'Supportive of crypto'
  }
  if (score >= 50) {
    return 'Neutral on crypto'
  }
  if (score >= 30) {
    return 'Against crypto'
  }
  return 'Strongly against crypto'
}

export const convertDTSIStanceScoreToCryptoSupportLanguage = (score: number | null) => {
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
    return twNoop('text-gray-600')
  }
  if (score > 50) {
    return twNoop('text-green-600')
  }
  if (score === 50) {
    return twNoop('text-gray-600')
  }
  return twNoop('text-red-600')
}

export const convertDTSIStanceScoreToBgColorClass = (score: number | null | undefined) => {
  if (isNil(score)) {
    return twNoop('bg-gray-100')
  }
  if (score > 50) {
    return twNoop('bg-green-100')
  }
  if (score === 50) {
    return twNoop('bg-gray-100')
  }
  return twNoop('bg-red-100')
}
