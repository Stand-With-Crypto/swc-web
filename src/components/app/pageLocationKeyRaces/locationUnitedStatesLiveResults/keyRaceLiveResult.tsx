import { useRef } from 'react'
import { DotFilledIcon } from '@radix-ui/react-icons'
import { isNil } from 'lodash-es'

import { DTSIAvatar, DTSIAvatarProps } from '@/components/app/dtsiAvatar'
import { DTSIFormattedLetterGrade } from '@/components/app/dtsiFormattedLetterGrade'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { DTSI_Person, DTSI_PersonPoliticalAffiliationCategory } from '@/data/dtsi/generated'
import { formatDTSIDistrictId, NormalizedDTSIDistrictId } from '@/utils/dtsi/dtsiPersonRoleUtils'
import {
  dtsiPersonFullName,
  dtsiPersonPoliticalAffiliationCategoryAbbreviation,
} from '@/utils/dtsi/dtsiPersonUtils'
import { convertDTSIPersonStanceScoreToCryptoSupportLanguageSentence } from '@/utils/dtsi/dtsiStanceScoreUtils'
import { US_STATE_CODE_TO_DISPLAY_NAME_MAP, USStateCode } from '@/utils/shared/usStateUtils'
import { cn, twNoop } from '@/utils/web/cn'

const convertDTSIStanceScoreToBgColorClass = (score: number | null | undefined) => {
  if (isNil(score)) {
    return twNoop('bg-gray-400')
  }
  if (score > 50) {
    return twNoop('bg-green-700')
  }
  if (score === 50) {
    return twNoop('bg-gray-500')
  }
  return twNoop('bg-red-700')
}

interface KeyRaceLiveResultProps {
  candidates: (DTSIAvatarProps['person'] &
    Pick<
      DTSI_Person,
      | 'politicalAffiliationCategory'
      | 'computedStanceScore'
      | 'computedSumStanceScoreWeight'
      | 'manuallyOverriddenStanceScore'
    >)[]
  stateCode: USStateCode
  primaryDistrict?: NormalizedDTSIDistrictId
  className?: string
}

export const KeyRaceLiveResult = (props: KeyRaceLiveResultProps) => {
  const { candidates, stateCode, primaryDistrict, className } = props

  const mockDate = useRef(new Date().toLocaleString())

  const stateName = US_STATE_CODE_TO_DISPLAY_NAME_MAP[stateCode as USStateCode]
  const raceName = primaryDistrict
    ? `${stateName} ${formatDTSIDistrictId(primaryDistrict)} Congressional District Race`
    : `${stateName} Senate Race`

  const candidateA = candidates?.[0] || {}
  const candidateB = candidates?.[1] || {}

  const getPoliticalCategoryAbbr = (category: DTSI_PersonPoliticalAffiliationCategory) => {
    if (!category) return ''
    return dtsiPersonPoliticalAffiliationCategoryAbbreviation(category) || ''
  }

  return (
    <div className={cn('flex w-full max-w-md flex-col gap-6', className)}>
      <div className="flex items-center justify-between">
        <div className="space-y-4">
          <p className="text-lg font-semibold">{raceName}</p>
          <p className="text-sm text-muted-foreground">Data updated {mockDate.current}</p>
        </div>

        <Badge className="px-1 pr-4 text-base" variant="green-subtle">
          <DotFilledIcon className="h-[30px] w-[30px]" />
          Live
        </Badge>
      </div>

      <div className="flex justify-between">
        <div>
          <div className="relative w-fit">
            <DTSIAvatar person={candidateA} size={125} />
            <DTSIFormattedLetterGrade
              className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full shadow-md"
              person={candidateA}
            />
          </div>
          <div className="mt-4 space-y-2">
            <p className="font-bold">
              {dtsiPersonFullName(candidateA)}
              {!!candidateA.politicalAffiliationCategory &&
                ` (${getPoliticalCategoryAbbr(candidateA.politicalAffiliationCategory)})`}
            </p>
            <p className="text-xs text-fontcolor-muted">
              {convertDTSIPersonStanceScoreToCryptoSupportLanguageSentence(candidateA)}
            </p>
          </div>
        </div>

        <div className="flex flex-col items-end text-right">
          <div className="relative w-fit">
            <DTSIAvatar person={candidateB} size={125} />
            <DTSIFormattedLetterGrade
              className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full shadow-md"
              person={candidateB}
            />
          </div>
          <div className="mt-4 space-y-2">
            <p className="font-bold">
              {dtsiPersonFullName(candidateB)}
              {!!candidateB.politicalAffiliationCategory &&
                ` (${getPoliticalCategoryAbbr(candidateB.politicalAffiliationCategory)})`}
            </p>
            <p className="text-xs text-fontcolor-muted">
              {convertDTSIPersonStanceScoreToCryptoSupportLanguageSentence(candidateB)}
            </p>
          </div>
        </div>
      </div>

      <div className="flex gap-1">
        <Progress
          className="rounded-l-full rounded-r-none bg-secondary"
          indicatorClassName={cn(
            'bg-none rounded-r-none',
            convertDTSIStanceScoreToBgColorClass(
              candidateA.manuallyOverriddenStanceScore || candidateA.computedStanceScore,
            ),
          )}
          value={50}
        />
        <Progress
          className="rounded-l-none rounded-r-full  bg-secondary"
          indicatorClassName={cn(
            'bg-none rounded-l-none',
            convertDTSIStanceScoreToBgColorClass(
              candidateB.manuallyOverriddenStanceScore || candidateB.computedStanceScore,
            ),
          )}
          inverted
          value={50}
        />
      </div>

      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2">
          <p className="font-bold">50%</p> <span className="text-fontcolor-muted">99,999,999</span>
        </div>

        <p className="text-sm text-fontcolor-muted">999 votes to win</p>

        <div className="flex items-center gap-2 text-right">
          <p className="font-bold">50%</p> <span className="text-fontcolor-muted">99,999,999</span>
        </div>
      </div>
    </div>
  )
}
