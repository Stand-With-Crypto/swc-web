import { DTSI_Person } from '@/data/dtsi/generated'
import {
  convertDTSIStanceScoreToLetterGrade,
  DTSILetterGrade,
} from '@/utils/dtsi/dtsiStanceScoreUtils'
import { cn, twNoop } from '@/utils/web/cn'

const getBgColor = (letterGrade: DTSILetterGrade | null) => {
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

export const DTSIFormattedLetterGrade: React.FC<
  (
    | { person: Pick<DTSI_Person, 'computedStanceScore' | 'manuallyOverriddenStanceScore'> }
    | { letterGrade: DTSILetterGrade | null }
  ) & {
    size: number
  }
> = ({ size, ...other }) => {
  const letterGrade =
    'letterGrade' in other ? other.letterGrade : convertDTSIStanceScoreToLetterGrade(other.person)

  return (
    <div
      className={cn(
        'relative inline-flex items-center justify-center rounded-full text-4xl',
        getBgColor(letterGrade),
      )}
      style={{ height: size, width: size }}
    >
      <div className="font-extrabold text-white" style={{ fontSize: size * 0.66, lineHeight: 1 }}>
        {letterGrade || '?'}
      </div>
    </div>
  )
}
