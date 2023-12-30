import { DTSIAvatar } from '@/components/app/dtsiAvatar'
import { DTSIFormattedLetterGrade } from '@/components/app/dtsiFormattedLetterGrade'
import { NextImage } from '@/components/ui/image'
import { InternalLink } from '@/components/ui/link'
import { LinkBox, linkBoxLinkClassName } from '@/components/ui/linkBox'
import { DTSI_Person, DTSI_PersonCardFragment } from '@/data/dtsi/generated'
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
    <LinkBox className="flex items-center justify-between rounded-md border bg-gray-100 p-5">
      <div className="flex flex-row items-center gap-3">
        <DTSIAvatar person={person} size={40} />
        <div>
          <div className="font-bold">
            <InternalLink
              href={getIntlUrls(locale).politicianDetails(person.slug)}
              className={linkBoxLinkClassName}
            >
              {dtsiPersonFullName(person)}{' '}
              {person.politicalAffiliationCategory
                ? `(${dtsiPersonPoliticalAffiliationCategoryAbbreviation(
                    person.politicalAffiliationCategory,
                  )})`
                : ''}
            </InternalLink>
          </div>
          {person.primaryRole && <div>{getDTSIFormattedShortPersonRole(person.primaryRole)}</div>}
        </div>
      </div>
      <div>
        <DTSIFormattedLetterGrade size={30} person={person} />
      </div>
    </LinkBox>
  )
}
