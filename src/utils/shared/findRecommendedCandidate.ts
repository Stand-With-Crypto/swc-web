import { convertDTSIPersonStanceScoreToLetterGrade } from '@/utils/dtsi/dtsiStanceScoreUtils'

export function findRecommendedCandidate<
  T extends {
    manuallyOverriddenStanceScore: number | null | undefined
    computedStanceScore: number | null | undefined
    computedSumStanceScoreWeight: number | null | undefined
  },
>(items: T[]) {
  const veryProCrypto: T[] = []
  const aboveThresholdProCrypto: T[] = []
  const belowThresholdAntiCrypto: T[] = []
  items.forEach(item => {
    const score = convertDTSIPersonStanceScoreToLetterGrade(item)
    if (score === 'A') {
      veryProCrypto.push(item)
    } else if (score === 'B' || score === 'C') {
      aboveThresholdProCrypto.push(item)
    } else {
      belowThresholdAntiCrypto.push(item)
    }
  })
  if (veryProCrypto.length === 1 && !aboveThresholdProCrypto.length) {
    return {
      recommended: veryProCrypto[0],
      others: belowThresholdAntiCrypto,
    }
  }
  return {
    recommended: null,
    others: items,
  }
}
