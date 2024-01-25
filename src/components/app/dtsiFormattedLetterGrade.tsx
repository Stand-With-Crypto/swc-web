import { NextImage } from '@/components/ui/image'

import { DTSI_Person } from '@/data/dtsi/generated'
import {
  convertDTSIStanceScoreToLetterGrade,
  DTSILetterGrade,
} from '@/utils/dtsi/dtsiStanceScoreUtils'
import { cn, twNoop } from '@/utils/web/cn'
import _ from 'lodash'

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

export const DTSIFormattedLetterGrade: React.FC<{
  person: Pick<DTSI_Person, 'computedStanceScore' | 'manuallyOverriddenStanceScore'>
  size: number
}> = ({ person, size }) => {
  const letterGrade = convertDTSIStanceScoreToLetterGrade(person)

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
        style={{ fontSize: size * 0.66, paddingTop: size * 0.05, lineHeight: 0 }}
      >
        {letterGrade || '?'}
      </div>
    </div>
  )
}
