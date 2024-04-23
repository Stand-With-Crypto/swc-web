import { DTSIAvatar } from '@/components/app/dtsiAvatar'
import { DTSIFormattedLetterGrade } from '@/components/app/dtsiFormattedLetterGrade'
import { InternalLink } from '@/components/ui/link'
import { LinkBox, linkBoxLinkClassName } from '@/components/ui/linkBox'
import { DTSI_PersonCardFragment } from '@/data/dtsi/generated'
import { SupportedLocale } from '@/intl/locales'
import {
  getDTSIPersonRoleCategoryDisplayName,
  getDTSIPersonRoleCategoryWithStateDisplayName,
} from '@/utils/dtsi/dtsiPersonRoleUtils'
import {
  dtsiPersonFullName,
  dtsiPersonPoliticalAffiliationCategoryAbbreviation,
} from '@/utils/dtsi/dtsiPersonUtils'
import {
  convertDTSIPersonStanceScoreToCryptoSupportLanguageSentence,
  convertDTSIStanceScoreToBgColorClass,
  convertDTSIStanceScoreToTextColorClass,
} from '@/utils/dtsi/dtsiStanceScoreUtils'
import { getIntlUrls } from '@/utils/shared/urls'
import { cn } from '@/utils/web/cn'

interface Props {
  person: DTSI_PersonCardFragment
  locale: SupportedLocale
  subheader: 'role' | 'role-w-state'
  overrideDescriptor?: 'hidden' | 'recommended'
  subheaderFormatter?: (str: string) => string
}

function SubHeader({ person, subheader, subheaderFormatter = arg => arg }: Props) {
  switch (subheader) {
    case 'role':
      return (
        person.primaryRole && (
          <div className="text-fontcolor-muted">
            {subheaderFormatter(getDTSIPersonRoleCategoryDisplayName(person.primaryRole))}
          </div>
        )
      )
    case 'role-w-state':
      return (
        person.primaryRole && (
          <div className="text-fontcolor-muted">
            {subheaderFormatter(getDTSIPersonRoleCategoryWithStateDisplayName(person.primaryRole))}
          </div>
        )
      )
  }
}

export function DTSIPersonCard(props: Props) {
  const { person, locale, overrideDescriptor } = props
  return (
    <LinkBox
      className={cn(
        'flex flex-col items-center justify-between text-left transition hover:drop-shadow-lg sm:flex-row sm:rounded-3xl sm:bg-secondary sm:p-6',
      )}
    >
      <div
        className={cn(
          'flex w-full flex-row items-center gap-4 max-sm:bg-secondary max-sm:p-6',
          overrideDescriptor === 'hidden' || 'max-sm:rounded-tl-3xl max-sm:rounded-tr-3xl',
        )}
      >
        <div className="relative h-[80px] w-[80px]">
          <DTSIAvatar person={person} size={80} />
          <div className="absolute bottom-0 right-[-8px]">
            <DTSIFormattedLetterGrade person={person} size={25} />
          </div>
        </div>
        <div>
          <div className="text-lg font-bold">
            <InternalLink
              className={linkBoxLinkClassName}
              href={getIntlUrls(locale).politicianDetails(person.slug)}
            >
              {dtsiPersonFullName(person)}{' '}
              {person.politicalAffiliationCategory
                ? `(${dtsiPersonPoliticalAffiliationCategoryAbbreviation(
                    person.politicalAffiliationCategory,
                  )})`
                : ''}
            </InternalLink>
          </div>
          <SubHeader {...props} />
        </div>
      </div>
      {overrideDescriptor === 'hidden' || (
        <div
          className={cn(
            'shrink-0 p-3 text-center font-bold text-background antialiased max-sm:w-full max-sm:rounded-bl-3xl max-sm:rounded-br-3xl sm:rounded-lg sm:p-4',
            overrideDescriptor === 'recommended'
              ? 'bg-purple-200 text-purple-700'
              : cn(
                  convertDTSIStanceScoreToTextColorClass(
                    person.manuallyOverriddenStanceScore || person.computedStanceScore || null,
                  ),
                  convertDTSIStanceScoreToBgColorClass(
                    person.manuallyOverriddenStanceScore || person.computedStanceScore || null,
                  ),
                ),
          )}
        >
          {overrideDescriptor === 'recommended'
            ? 'Recommended candidate'
            : convertDTSIPersonStanceScoreToCryptoSupportLanguageSentence(person)}
        </div>
      )}
    </LinkBox>
  )
}
