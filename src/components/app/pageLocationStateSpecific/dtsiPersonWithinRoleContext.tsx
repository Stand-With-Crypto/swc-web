import { DTSIAvatar } from '@/components/app/dtsiAvatar'
import { FormattedPerson } from '@/components/app/pageLocationStateSpecific/types'
import { InternalLink } from '@/components/ui/link'
import { LinkBox, linkBoxLinkClassName } from '@/components/ui/linkBox'
import { SupportedLocale } from '@/intl/locales'
import { dtsiPersonFullName } from '@/utils/dtsi/dtsiPersonUtils'
import { pluralize } from '@/utils/shared/pluralize'
import { getIntlUrls } from '@/utils/shared/urls'

export function DTSIPersonCardForLocation({
  person,
  locale,
}: {
  person: FormattedPerson
  locale: SupportedLocale
}) {
  return (
    <LinkBox className="flex items-center justify-between gap-3">
      <div className="flex flex-row items-center gap-3">
        <DTSIAvatar person={person} size={120} />
        <InternalLink
          className={linkBoxLinkClassName}
          href={getIntlUrls(locale).politicianDetails(person.slug)}
        >
          <div className="font-bold text-fontcolor">{dtsiPersonFullName(person)} </div>
          <div className="text-fontcolor-muted">
            {person.stanceCount || 0} crypto{' '}
            {pluralize({
              singular: 'statement',
              plural: 'statements',
              count: person.stanceCount || 0,
            })}
          </div>
        </InternalLink>
      </div>
    </LinkBox>
  )
}
