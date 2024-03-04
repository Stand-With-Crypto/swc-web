import { DTSIAvatar } from '@/components/app/dtsiAvatar'
import { DTSIFormattedLetterGrade } from '@/components/app/dtsiFormattedLetterGrade'
import { InternalLink } from '@/components/ui/link'
import { LinkBox, linkBoxLinkClassName } from '@/components/ui/linkBox'
import { DTSI_PersonCardFragment } from '@/data/dtsi/generated'
import { SupportedLocale } from '@/intl/locales'
import { getDTSIFormattedShortPersonRole } from '@/utils/dtsi/dtsiPersonRoleUtils'
import {
  dtsiPersonFullName,
  dtsiPersonPoliticalAffiliationCategoryAbbreviation,
} from '@/utils/dtsi/dtsiPersonUtils'
import { getIntlUrls } from '@/utils/shared/urls'

export function DTSIPersonCard({
  person,
  locale,
}: {
  person: DTSI_PersonCardFragment
  locale: SupportedLocale
}) {
  return (
    <LinkBox className="flex items-center justify-between gap-3 rounded-3xl bg-secondary p-5 transition hover:drop-shadow-lg">
      <div className="flex flex-row items-center gap-3">
        <DTSIAvatar person={person} size={60} />
        <div>
          <div className="font-bold">
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
          {person.primaryRole && (
            <div className="text-fontcolor-muted">
              {getDTSIFormattedShortPersonRole(person.primaryRole)}
            </div>
          )}
        </div>
      </div>
      <div>
        <DTSIFormattedLetterGrade person={person} size={40} />
      </div>
    </LinkBox>
  )
}
