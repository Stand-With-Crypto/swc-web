import { DTSI_Person } from '@/data/dtsi/generated'
import {
  convertDTSIPersonStanceScoreToLetterGrade,
  DTSILetterGrade,
} from '@/utils/dtsi/dtsiStanceScoreUtils'

export const DTSIFormattedLetterGrade: React.FC<
  (
    | { person: Pick<DTSI_Person, 'computedStanceScore' | 'manuallyOverriddenStanceScore'> }
    | { letterGrade: DTSILetterGrade | null }
  ) & {
    className: string
  }
> = ({ className, ...other }) => {
  const letterGrade =
    'letterGrade' in other
      ? other.letterGrade
      : convertDTSIPersonStanceScoreToLetterGrade(other.person)
  function getLetterGradeImage() {
    switch (letterGrade) {
      case 'A':
        return '/dtsiLetterGrade/a-grade.svg'
      case 'B':
        return '/dtsiLetterGrade/b-grade-light.svg'
      case 'C':
        return '/dtsiLetterGrade/c-grade.svg'
      case 'D':
        return '/dtsiLetterGrade/d-grade-light.svg'
      case 'F':
        return '/dtsiLetterGrade/f-grade.svg'
      default:
        return '/dtsiLetterGrade/no-stance.svg'
    }
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      alt={letterGrade ? `Crypto letter grade of ${letterGrade}` : 'No crypto letter grade'}
      className={className}
      src={getLetterGradeImage()}
    />
  )
}
