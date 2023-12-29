import { NextImage } from '@/components/ui/image'
import { ImageAvatar, ImageAvatarProps } from '@/components/ui/imageAvatar'
import { InitialsAvatar } from '@/components/ui/initialsAvatar'

import { DTSI_Person } from '@/data/dtsi/generated'
import {
  convertDTSIStanceScoreToLetterGrade,
  DTSILetterGrade,
} from '@/utils/dtsi/dtsiStanceScoreUtils'
import _ from 'lodash'

const getImage = (letterGrade: DTSILetterGrade | null) => {
  switch (letterGrade) {
    case 'A':
    case 'B':
      return '/dtsiLetterGrade/green.svg'

    case 'C':
      return '/dtsiLetterGrade/yellow.svg'
    case 'D':
    case 'F':
      return '/dtsiLetterGrade/red.svg'
  }
  return '/dtsiLetterGrade/grey.svg'
}

export const DTSIFormattedLetterGrade: React.FC<{
  person: Pick<DTSI_Person, 'computedStanceScore' | 'manuallyOverriddenStanceScore'>
  size: number
}> = ({ person, size, ...props }) => {
  const letterGrade = convertDTSIStanceScoreToLetterGrade(person)

  return (
    <div className="relative inline-block">
      <div
        className="absolute bottom-0 left-0 right-0 top-0 flex items-center justify-center text-center font-extrabold leading-none text-white"
        style={{ fontSize: size * 0.66, paddingBottom: size * 0.1 }}
      >
        <div>{letterGrade || '?'}</div>
      </div>
      <NextImage
        alt={`Crypto letter grade of ${letterGrade || 'N/A'}`}
        width={size}
        height={size}
        src={getImage(letterGrade)}
      />
    </div>
  )
}
