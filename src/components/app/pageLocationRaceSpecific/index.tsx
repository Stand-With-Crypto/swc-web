import { FormattedPerson } from '@/components/app/pageLocationRaceSpecific/types'
import { REGISTRATION_URLS_BY_STATE } from '@/components/app/userActionFormVoterRegistration/constants'
import { Button } from '@/components/ui/button'
import { uppercaseSectionHeader } from '@/components/ui/classUtils'
import { ConditionalSearchParamGoBack } from '@/components/ui/conditionalSearchParamGoBack'
import { InternalLinkWihSearchParamGoBack } from '@/components/ui/conditionalSearchParamGoBack/internalLinkWihSearchParamGoBack'
import { MaybeNextImg } from '@/components/ui/image'
import { InitialsAvatar } from '@/components/ui/initialsAvatar'
import { ExternalLink, InternalLink } from '@/components/ui/link'
import { PageTitle } from '@/components/ui/pageTitleText'
import {
  DTSI_DistrictSpecificInformationQuery,
  DTSI_PersonRoleCategory,
} from '@/data/dtsi/generated'
import { SupportedLocale } from '@/intl/locales'
import { NormalizedDTSIDistrictId } from '@/utils/dtsi/dtsiPersonRoleUtils'
import {
  dtsiPersonFullName,
  getDTSIPersonProfilePictureUrlDimensions,
} from '@/utils/dtsi/dtsiPersonUtils'
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
    <div className="flex flex-col sm:flex-row sm:items-center sm:gap-5">
      <div className="sm:w-[230px]">
        {person.profilePictureUrl ? (
          <div className="mb-6 max-w-[230px] overflow-hidden rounded-xl sm:mb-0">
            <MaybeNextImg
              alt={`profile picture of ${dtsiPersonFullName(person)}`}
              sizes={`${230}px`}
              {...(getDTSIPersonProfilePictureUrlDimensions(person) || {})}
              className="w-full"
              src={person.profilePictureUrl}
            />
          </div>
        ) : (
          <div className="mx-auto mb-6 max-w-[100px] sm:mb-0">
            <InitialsAvatar
              firstInitial={(person.firstNickname || person.firstName).slice(0, 1)}
              lastInitial={person.lastName.slice(0, 1)}
              size={100}
            />
          </div>
        )}
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
          <Button asChild className="w-full" variant="secondary">
            <InternalLinkWihSearchParamGoBack href={urls.politicianDetails(person.slug)}>
              View profile
            </InternalLinkWihSearchParamGoBack>
          </Button>
        </div>
      </div>
    </div>
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
    <div className="container max-w-sm space-y-20 sm:max-w-4xl">
      <div className="relative text-left sm:text-center">
        <ConditionalSearchParamGoBack />
        <h1 className={cn(uppercaseSectionHeader, 'mb-4')}>
          Crypto Voter Guide{' > '}
          <InternalLink href={urls.locationStateSpecific(stateCode)}>{stateCode}</InternalLink>
        </h1>
        <PageTitle as="h2" className="mb-6 text-left sm:text-center" size="md">
          {district
            ? `${stateCode} Congressional District ${district}`
            : `U.S. Senate (${stateCode})`}
        </PageTitle>
        <Button asChild className="w-full max-w-sm">
          <ExternalLink href={REGISTRATION_URLS_BY_STATE[stateCode].registerUrl}>
            Register to vote
          </ExternalLink>
        </Button>
      </div>
      <div className="divide-y-2 *:py-20 first:*:pt-0 last:*:pb-0">
        {!!groups.current.length && (
          <section className="mx-auto max-w-2xl space-y-5">
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
          <section className="mx-auto max-w-2xl space-y-5">
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
