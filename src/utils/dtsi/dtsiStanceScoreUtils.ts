import { DTSI_Person } from '@/data/dtsi/generated'
import { twNoop } from '@/utils/web/cn'

export enum DTSILetterGrade {
  A = 'A',
  B = 'B',
  C = 'C',
  D = 'D',
  F = 'F',
}

type EntityWithStanceScore = Pick<
  DTSI_Person,
  'computedStanceScore' | 'manuallyOverriddenStanceScore'
>

const getScore = (item: EntityWithStanceScore) =>
  item.manuallyOverriddenStanceScore ?? item.computedStanceScore

export const convertDTSIStanceScoreToLetterGrade = (entity: EntityWithStanceScore) => {
  const score = getScore(entity)
  if (!score) {
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

export const convertDTSIStanceScoreToCryptoSupportLanguage = (entity: EntityWithStanceScore) => {
  const score = getScore(entity)
  if (!score) {
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

export const convertDTSIStanceScoreToTextColorClass = (entity: EntityWithStanceScore) => {
  const score = getScore(entity)
  if (!score) {
    return twNoop('text-gray-600')
  }
  if (score >= 90) {
    return twNoop('text-green-800')
  }
  if (score >= 70) {
    return twNoop('text-green-800')
  }
  if (score >= 50) {
    return twNoop('text-gray-600')
  }
  if (score >= 30) {
    return twNoop('text-red-800')
  }
  return twNoop('text-red-800')
}
