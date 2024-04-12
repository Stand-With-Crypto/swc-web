import { DTSI_Person } from '@/data/dtsi/generated'
import {
  convertDTSIPersonStanceScoreToLetterGrade,
  DTSILetterGrade,
} from '@/utils/dtsi/dtsiStanceScoreUtils'
import { cn, twNoop } from '@/utils/web/cn'

export const getBgColor = (letterGrade: DTSILetterGrade | null) => {
  switch (letterGrade) {
    case 'A':
    case 'B':
      return twNoop('bg-green-600')

    case 'C':
      return twNoop('bg-yellow-600')
    case 'D':
    case 'F':
      return twNoop('bg-red-600')
  }
  return twNoop('bg-gray-600')
}

export const getBgHexColor = (letterGrade: DTSILetterGrade | null) => {
  switch (letterGrade) {
    case 'A':
    case 'B':
      return '#00af47'

    case 'C':
      return '#c4ae00'
    case 'D':
    case 'F':
      return '#e10000'
  }
  return '#4b5563'
}

export const DTSIFormattedLetterGrade: React.FC<
  (
    | { person: Pick<DTSI_Person, 'computedStanceScore' | 'manuallyOverriddenStanceScore'> }
    | { letterGrade: DTSILetterGrade | null }
  ) & {
    size: number
  }
> = ({ size, ...other }) => {
  const letterGrade =
    'letterGrade' in other
      ? other.letterGrade
      : convertDTSIPersonStanceScoreToLetterGrade(other.person)

  return (
    <div
      className={cn(
        'relative inline-flex items-center justify-center rounded-full text-4xl',
        getBgColor(letterGrade),
      )}
      style={{ width: size, height: size }}
    >
      <div
        className="font-extrabold text-white"
        style={{
          fontSize: size * 0.66,
          lineHeight: 1,
          paddingLeft:
            letterGrade === 'D' || letterGrade === 'F' || letterGrade === 'B' ? size * 0.05 : 0,
        }}
      >
        {letterGrade || '?'}
      </div>
    </div>
  )
}
