import { CryptoSupportHighlight } from '@/components/app/cryptoSupportHighlight'
import { DTSIPersonCard } from '@/components/app/dtsiPersonCard'
import { DTSIStanceDetails } from '@/components/app/dtsiStanceDetails'
import { REGISTRATION_URLS_BY_STATE } from '@/components/app/userActionFormVoterRegistration/constants'
import { Button } from '@/components/ui/button'
import { InternalLink } from '@/components/ui/link'
import { PageTitle } from '@/components/ui/pageTitleText'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { TrackedExternalLink } from '@/components/ui/trackedExternalLink'
import {
  DTSI_DistrictSpecificInformationQuery,
  DTSI_PersonRoleCategory,
} from '@/data/dtsi/generated'
import { SupportedLocale } from '@/intl/locales'
import { NormalizedDTSIDistrictId } from '@/utils/dtsi/dtsiPersonRoleUtils'
import {
  formatSpecificRoleDTSIPerson,
  SpecificRoleDTSIPerson,
} from '@/utils/dtsi/specificRoleDTSIPerson'
import { getIntlUrls } from '@/utils/shared/urls'
import { US_STATE_CODE_TO_DISPLAY_NAME_MAP, USStateCode } from '@/utils/shared/usStateUtils'

type FormattedPerson = SpecificRoleDTSIPerson<DTSI_DistrictSpecificInformationQuery['people'][0]>

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
  formatted.sort((a, b) => (a.isIncumbent === b.isIncumbent ? 0 : a.isIncumbent ? -1 : 1))
  return formatted
}

function CandidateInfo({
  person,
  locale,
}: { person: FormattedPerson } & Pick<LocationRaceSpecificProps, 'locale'>) {
  return (
    <div>
      <div className="container max-w-4xl">
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
      <section className="space-y-20">
        {groups.map(person => (
          <CandidateInfo key={person.id} {...{ locale, person }} />
        ))}
      </section>
    </div>
  )
}
