import { NextImage } from '@/components/ui/image'
import { ImageAvatar, ImageAvatarProps } from '@/components/ui/imageAvatar'
import { InitialsAvatar } from '@/components/ui/initialsAvatar'

import { DTSI_Person } from '@/data/dtsi/generated'
import { convertDTSIStanceScoreToLetterGrade, DTSILetterGrade } from '@/utils/dtsi/dtsiPersonUtils'
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
}> = ({ person, ...props }) => {
  const score = person.manuallyOverriddenStanceScore ?? person.computedStanceScore
  const letterGrade = _.isNil(score) ? null : convertDTSIStanceScoreToLetterGrade(score)

  return (
    <div className="relative">
      <div className="absolute left-0 right-0 text-center text-xl font-extrabold text-white">
        {letterGrade}
      </div>
      <NextImage
        alt={`Crypto letter grade of ${letterGrade || 'N/A'}`}
        width={30}
        height={30}
        src={getImage(letterGrade)}
      />
    </div>
  )
}
