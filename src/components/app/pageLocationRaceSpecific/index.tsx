import { DTSIAvatar } from '@/components/app/dtsiAvatar'
import { FormattedPerson } from '@/components/app/pageLocationRaceSpecific/types'
import { REGISTRATION_URLS_BY_STATE } from '@/components/app/userActionFormVoterRegistration/constants'
import { Button } from '@/components/ui/button'
import { uppercaseSectionHeader } from '@/components/ui/classUtils'
import { InternalLink } from '@/components/ui/link'
import { LinkBox, linkBoxLinkClassName } from '@/components/ui/linkBox'
import { PageTitle } from '@/components/ui/pageTitleText'
import { TrackedExternalLink } from '@/components/ui/trackedExternalLink'
import {
  DTSI_DistrictSpecificInformationQuery,
  DTSI_PersonRoleCategory,
} from '@/data/dtsi/generated'
import { SupportedLocale } from '@/intl/locales'
import { NormalizedDTSIDistrictId } from '@/utils/dtsi/dtsiPersonRoleUtils'
import { dtsiPersonFullName } from '@/utils/dtsi/dtsiPersonUtils'
import { formatStateSpecificDTSIPerson } from '@/utils/dtsi/stateSpecificDTSIPerson'
import { gracefullyError } from '@/utils/shared/gracefullyError'
import { pluralize } from '@/utils/shared/pluralize'
import { getIntlUrls } from '@/utils/shared/urls'
import { USStateCode } from '@/utils/shared/usStateUtils'
import { cn } from '@/utils/web/cn'

interface LocationRaceSpecificProps extends DTSI_DistrictSpecificInformationQuery {
  stateCode: USStateCode
  district?: NormalizedDTSIDistrictId
  locale: SupportedLocale
}

function organizeRaceSpecificPeople(
  people: DTSI_DistrictSpecificInformationQuery['people'],
  { district }: Pick<LocationRaceSpecificProps, 'district'>,
) {
  const targetedRoleCategory = district
    ? DTSI_PersonRoleCategory.CONGRESS
    : DTSI_PersonRoleCategory.SENATE

  const formatted = people.map(x =>
    formatStateSpecificDTSIPerson(x, {
      specificRole: targetedRoleCategory,
    }),
  )
  const grouped = {
    current: [] as FormattedPerson[],
    runningFor: [] as FormattedPerson[],
  }
  formatted.forEach(person => {
    if (person.currentStateSpecificRole) {
      if (person.currentStateSpecificRole.roleCategory === targetedRoleCategory) {
        grouped.current.push(person)
      } else {
        gracefullyError({
          msg: 'Unexpected currentStateSpecificRole',
          fallback: null,
          hint: { extra: { person } },
        })
      }
    } else if (person.runningForStateSpecificRole) {
      if (person.runningForStateSpecificRole.roleCategory === targetedRoleCategory) {
        grouped.runningFor.push(person)
      } else {
        gracefullyError({
          msg: 'Unexpected runningForStateSpecificRole',
          fallback: null,
          hint: { extra: { person } },
        })
      }
    }
  })
  return grouped
}

function CandidateInfo({
  person,
  locale,
}: { person: FormattedPerson } & Pick<LocationRaceSpecificProps, 'locale'>) {
  const urls = getIntlUrls(locale)
  return (
    <LinkBox className="flex flex-col sm:flex-row sm:items-center sm:gap-5">
      <div className="sm:w-[230px]">
        <DTSIAvatar person={person} size={230} />
      </div>
      <div>
        <PageTitle as="h4" className="text-left" size="sm">
          {dtsiPersonFullName(person)}
        </PageTitle>
        <div className="mt-2 text-fontcolor-muted">
          {person.stanceCount || 0} crypto{' '}
          {pluralize({
            singular: 'statement',
            plural: 'statements',
            count: person.stanceCount || 0,
          })}
        </div>
        <div className="mt-6">
          <Button asChild className={cn('w-full', linkBoxLinkClassName)} variant="secondary">
            <InternalLink href={urls.politicianDetails(person.slug)}>View profile</InternalLink>
          </Button>
        </div>
      </div>
    </LinkBox>
  )
}

export function LocationRaceSpecific({
  stateCode,
  district,
  people,
  locale,
}: LocationRaceSpecificProps) {
  const urls = getIntlUrls(locale)
  const groups = organizeRaceSpecificPeople(people, { district })
  return (
    <div className="container space-y-20">
      <div className="flex flex-col text-left sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className={cn(uppercaseSectionHeader, 'mb-6 md:mb-10')}>
            <InternalLink href={urls.locationStateSpecific(stateCode)}>
              CA Crypto Voter Guide
            </InternalLink>
            {' > '}{' '}
            {district
              ? `${stateCode} Congressional District ${district}`
              : `U.S. Senate (${stateCode})`}
          </h1>
          <PageTitle as="h2" className="mb-6 text-left sm:mb-0 sm:text-center" size="md">
            {district
              ? `${stateCode} Congressional District ${district}`
              : `U.S. Senate (${stateCode})`}
          </PageTitle>
        </div>
        <Button asChild className="w-full max-w-sm sm:w-fit">
          <TrackedExternalLink
            eventProperties={{ Category: 'Register To Vote' }}
            href={REGISTRATION_URLS_BY_STATE[stateCode].registerUrl}
          >
            Register to vote
          </TrackedExternalLink>
        </Button>
      </div>
      <div className="divide-y-2 *:py-20 first:*:pt-0 last:*:pb-0">
        {!!groups.current.length && (
          <section className="space-y-5">
            <h3 className={cn(uppercaseSectionHeader)}>
              {pluralize({
                count: groups.current.length,
                singular: 'Incumbent',
                plural: 'Incumbents',
              })}
            </h3>
            {groups.current.map(person => (
              <CandidateInfo key={person.id} {...{ locale, person }} />
            ))}
          </section>
        )}
        {!!groups.runningFor.length && (
          <section className="space-y-5">
            <h3 className={cn(uppercaseSectionHeader)}>
              {pluralize({
                count: groups.runningFor.length,
                singular: 'Candidate',
                plural: 'Candidates',
              })}
            </h3>
            {groups.runningFor.map(person => (
              <CandidateInfo key={person.id} {...{ locale, person }} />
            ))}
          </section>
        )}
      </div>
    </div>
  )
}
