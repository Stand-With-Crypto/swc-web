import { DTSI_Person } from '@/data/dtsi/generated'
import {
  convertDTSIPersonStanceScoreToLetterGrade,
  DTSILetterGrade,
  isAntiCrypto,
  isNeutralOnCrypto,
  isProCrypto,
} from '@/utils/dtsi/dtsiStanceScoreUtils'

export const DTSIThumbsUpOrDownGrade: React.FC<
  (
    | {
        person: Pick<
          DTSI_Person,
          'computedStanceScore' | 'manuallyOverriddenStanceScore' | 'computedSumStanceScoreWeight'
        >
      }
    | { letterGrade: DTSILetterGrade | null }
  ) & {
    className?: string
  }
> = ({ className, ...other }) => {
  const letterGrade =
    'letterGrade' in other
      ? other.letterGrade
      : convertDTSIPersonStanceScoreToLetterGrade(other.person)

  function getGradeImage() {
    if (isProCrypto(letterGrade)) {
      return '/dtsiLetterGrade/thumbs-up.svg'
    }
    if (isAntiCrypto(letterGrade)) {
      return '/dtsiLetterGrade/thumbs-down.svg'
    }
    if (isNeutralOnCrypto(letterGrade)) {
      return '/dtsiLetterGrade/neutral.svg'
    }
    return '/dtsiLetterGrade/no-stance.svg'
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img alt="Politician's crypto stance" className={className} src={getGradeImage()} />
  )
}
