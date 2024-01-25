import { DTSI_Person } from '@/data/dtsi/generated'
import { twNoop } from '@/utils/web/cn'
import _ from 'lodash'

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
  if (_.isNil(score)) {
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
  if (_.isNil(score)) {
    return 'Pending'
  }
  if (score >= 90) {
    return 'Very supportive'
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
  return 'Very against'
}

export const convertDTSIStanceScoreToCryptoSupportLanguageSentence = (
  entity: EntityWithStanceScore,
) => {
  const score = getScore(entity)
  if (_.isNil(score)) {
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

export const convertDTSIStanceScoreToTextColorClass = (entity: EntityWithStanceScore) => {
  const score = getScore(entity)
  if (_.isNil(score)) {
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
