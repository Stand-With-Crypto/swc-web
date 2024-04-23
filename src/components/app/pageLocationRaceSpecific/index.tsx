import { CryptoSupportHighlight } from '@/components/app/cryptoSupportHighlight'
import { DTSIAvatar } from '@/components/app/dtsiAvatar'
import { DTSIPersonCard } from '@/components/app/dtsiPersonCard'
import { DTSIStanceDetails } from '@/components/app/dtsiStanceDetails'
import { FormattedPerson } from '@/components/app/pageLocationRaceSpecific/types'
import { REGISTRATION_URLS_BY_STATE } from '@/components/app/userActionFormVoterRegistration/constants'
import { Button } from '@/components/ui/button'
import { uppercaseSectionHeader } from '@/components/ui/classUtils'
import { InternalLink } from '@/components/ui/link'
import { LinkBox, linkBoxLinkClassName } from '@/components/ui/linkBox'
import { PageTitle } from '@/components/ui/pageTitleText'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { TrackedExternalLink } from '@/components/ui/trackedExternalLink'
import {
  DTSI_DistrictSpecificInformationQuery,
  DTSI_PersonRoleCategory,
  DTSI_PersonStanceType,
} from '@/data/dtsi/generated'
import { SupportedLocale } from '@/intl/locales'
import { NormalizedDTSIDistrictId } from '@/utils/dtsi/dtsiPersonRoleUtils'
import { dtsiPersonFullName } from '@/utils/dtsi/dtsiPersonUtils'
import { formatSpecificRoleDTSIPerson } from '@/utils/dtsi/specificRoleDTSIPerson'
import { gracefullyError } from '@/utils/shared/gracefullyError'
import { pluralize } from '@/utils/shared/pluralize'
import { getIntlUrls } from '@/utils/shared/urls'
import { US_STATE_CODE_TO_DISPLAY_NAME_MAP, USStateCode } from '@/utils/shared/usStateUtils'
import { cn } from '@/utils/web/cn'

interface LocationRaceSpecificProps extends DTSI_DistrictSpecificInformationQuery {
  stateCode?: USStateCode
  district?: NormalizedDTSIDistrictId
  locale: SupportedLocale
}

function organizeRaceSpecificPeople(
  people: DTSI_DistrictSpecificInformationQuery['people'],
  { district, stateCode }: Pick<LocationRaceSpecificProps, 'district' | 'stateCode'>,
) {
  const targetedRoleCategory = district
    ? DTSI_PersonRoleCategory.CONGRESS
    : stateCode
      ? DTSI_PersonRoleCategory.SENATE
      : DTSI_PersonRoleCategory.PRESIDENT

  const formatted = people.map(x =>
    formatSpecificRoleDTSIPerson(x, {
      specificRole: targetedRoleCategory,
    }),
  )
  const grouped = {
    current: [] as FormattedPerson[],
    runningFor: [] as FormattedPerson[],
  }
  formatted.forEach(person => {
    if (person.currentSpecificRole) {
      if (person.currentSpecificRole.roleCategory === targetedRoleCategory) {
        grouped.current.push(person)
      } else {
        gracefullyError({
          msg: 'Unexpected currentSpecificRole',
          fallback: null,
          hint: { extra: { person } },
        })
      }
    } else if (person.runningForSpecificRole) {
      if (person.runningForSpecificRole.roleCategory === targetedRoleCategory) {
        grouped.runningFor.push(person)
      } else {
        gracefullyError({
          msg: 'Unexpected runningForSpecificRole',
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
  return (
    <div>
      <div className="container">
        <DTSIPersonCard key={person.id} locale={locale} person={person} subheader="role" />
      </div>
      {!!person.stances.length && (
        <>
          <h3 className="my-3 text-center font-bold">Relevant Statements</h3>
          <ScrollArea>
            <div className="flex gap-5 pl-4">
              {person.stances.map(stance => {
                return (
                  <div className="w-[300px] shrink-0 lg:w-[500px]" key={stance.id}>
                    <DTSIStanceDetails
                      bodyClassName="line-clamp-6"
                      hideImages
                      locale={locale}
                      person={person}
                      stance={stance}
                    />
                    <CryptoSupportHighlight
                      className="mx-auto mt-2"
                      stanceScore={stance.computedStanceScore || null}
                    />
                  </div>
                )
              })}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </>
      )}
    </div>
  )
}

export function LocationRaceSpecific({
  stateCode,
  district,
  people,
  locale,
}: LocationRaceSpecificProps) {
  const groups = organizeRaceSpecificPeople(people, { district, stateCode })
  const stateDisplayName = stateCode && US_STATE_CODE_TO_DISPLAY_NAME_MAP[stateCode]
  const urls = getIntlUrls(locale)
  return (
    <div className=" space-y-20">
      <div className="container text-center">
        <h2 className={'mb-4 text-fontcolor-muted'}>
          <InternalLink className="text-fontcolor-muted" href={urls.locationUnitedStates()}>
            United States
          </InternalLink>
          {' / '}
          {(() => {
            if (!stateDisplayName) {
              return <span className="font-bold text-primary-cta">Presidential</span>
            }
            return (
              <>
                <InternalLink
                  className="text-fontcolor-muted"
                  href={urls.locationStateSpecific(stateCode)}
                >
                  {stateDisplayName}
                </InternalLink>{' '}
                /{' '}
                <span className="font-bold text-primary-cta">
                  {district
                    ? `${stateCode} Congressional District ${district}`
                    : `U.S. Senate (${stateCode})`}
                </span>
              </>
            )
          })()}
        </h2>
        <PageTitle as="h1" className="mb-4" size="md">
          {!stateCode
            ? 'U.S. Presidential Race'
            : district
              ? `${stateCode} Congressional District ${district}`
              : `U.S. Senate (${stateCode})`}
        </PageTitle>
        {stateCode && (
          <Button asChild className="mt-6 w-full max-w-xs">
            <TrackedExternalLink
              eventProperties={{ Category: 'Register To Vote' }}
              href={REGISTRATION_URLS_BY_STATE[stateCode].registerUrl}
            >
              Register to vote
            </TrackedExternalLink>
          </Button>
        )}
      </div>

      <div className="divide-y-2 *:py-20 first:*:pt-0 last:*:pb-0">
        {!!groups.current.length && (
          <section className="space-y-16">
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
          <section className="space-y-16">
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
