import { isNil } from 'lodash-es'

import { DTSIAvatar } from '@/components/app/dtsiAvatar'
import { DTSIFormattedLetterGrade } from '@/components/app/dtsiFormattedLetterGrade'
import { DTSI_PersonCardFragment } from '@/data/dtsi/generated'
import { getDTSIPersonRoleCategoryWithStateDisplayName } from '@/utils/dtsi/dtsiPersonRoleUtils'
import {
  dtsiPersonFullName,
  dtsiPersonPoliticalAffiliationCategoryAbbreviation,
} from '@/utils/dtsi/dtsiPersonUtils'
import {
  convertDTSIStanceScoreToBgColorClass,
  convertDTSIStanceScoreToCryptoSupportLanguage,
  convertDTSIStanceScoreToTextColorClass,
} from '@/utils/dtsi/dtsiStanceScoreUtils'
import { cn } from '@/utils/web/cn'

interface DtsiPersonCardWithGradeFooter {
  person: DTSI_PersonCardFragment
}

export function DtsiPersonCardWithStanceFooter({ person }: DtsiPersonCardWithGradeFooter) {
  const stanceScore = person.manuallyOverriddenStanceScore || person.computedStanceScore
  const politicalAffiliationCategoryAbbreviation =
    person.politicalAffiliationCategory &&
    dtsiPersonPoliticalAffiliationCategoryAbbreviation(person.politicalAffiliationCategory)
  const politicalAbbrDisplayName = politicalAffiliationCategoryAbbreviation
    ? ` (${politicalAffiliationCategoryAbbreviation})`
    : ''
  const displayName = `${dtsiPersonFullName(person)}${politicalAbbrDisplayName}`
  const personRoleAndState = person?.primaryRole
    ? getDTSIPersonRoleCategoryWithStateDisplayName(person?.primaryRole)
    : ''

  return (
    <div
      className="flex w-full flex-col items-center text-sm md:text-base lg:max-w-[345px]"
      key={person.id}
    >
      <div className="flex w-full gap-4 rounded-tl-2xl rounded-tr-2xl bg-backgroundAlternate p-6">
        <div className="relative">
          <DTSIAvatar person={person} size={60} />
          <div className="absolute bottom-[-8px] right-[-8px]">
            <DTSIFormattedLetterGrade className="h-6 w-6" person={person} />
          </div>
        </div>
        <div>
          <strong>{displayName}</strong>
          <p>{personRoleAndState}</p>
        </div>
      </div>

      <div
        className={cn(
          'flex w-full justify-center gap-2 rounded-2xl rounded-tl-none rounded-tr-none px-8 py-4 text-lg font-bold text-background',
          convertDTSIStanceScoreToTextColorClass(stanceScore),
          convertDTSIStanceScoreToBgColorClass(stanceScore),
        )}
      >
        <div>
          {isNil(stanceScore)
            ? 'Unknown stance on crypto'
            : convertDTSIStanceScoreToCryptoSupportLanguage(stanceScore)}
        </div>
      </div>
    </div>
  )
}
