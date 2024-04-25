import { DTSIPersonCard } from '@/components/app/dtsiPersonCard'
import { PACFooter } from '@/components/app/pacFooter'
import { REGISTRATION_URLS_BY_STATE } from '@/components/app/userActionFormVoterRegistration/constants'
import { Button } from '@/components/ui/button'
import { InternalLink } from '@/components/ui/link'
import { PageTitle } from '@/components/ui/pageTitleText'
import { TrackedExternalLink } from '@/components/ui/trackedExternalLink'
import {
  DTSI_DistrictSpecificInformationQuery,
  DTSI_PersonRoleCategory,
} from '@/data/dtsi/generated'
import { SupportedLocale } from '@/intl/locales'
import { NormalizedDTSIDistrictId } from '@/utils/dtsi/dtsiPersonRoleUtils'
import { dtsiPersonFullName } from '@/utils/dtsi/dtsiPersonUtils'
import { formatSpecificRoleDTSIPerson } from '@/utils/dtsi/specificRoleDTSIPerson'
import { findRecommendedCandidate } from '@/utils/shared/findRecommendedCandidate'
import { getIntlUrls } from '@/utils/shared/urls'
import { US_STATE_CODE_TO_DISPLAY_NAME_MAP, USStateCode } from '@/utils/shared/usStateUtils'

import { CandidateInfo } from './candidateInformation'

export interface LocationRaceSpecificProps extends DTSI_DistrictSpecificInformationQuery {
  stateCode: USStateCode
  district?: NormalizedDTSIDistrictId
  locale: SupportedLocale
}

function organizeRaceSpecificPeople(
  people: DTSI_DistrictSpecificInformationQuery['people'],
  { district }: Pick<LocationRaceSpecificProps, 'district' | 'stateCode'>,
) {
  const targetedRoleCategory = district
    ? DTSI_PersonRoleCategory.CONGRESS
    : DTSI_PersonRoleCategory.SENATE

  const formatted = people.map(x =>
    formatSpecificRoleDTSIPerson(x, {
      specificRole: targetedRoleCategory,
    }),
  )
  formatted.sort((a, b) => (a.isIncumbent === b.isIncumbent ? 0 : a.isIncumbent ? -1 : 1))
  return formatted
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
  const { recommended, others } = findRecommendedCandidate(groups)
  return (
    <div className="container mx-auto max-w-4xl space-y-20">
      <div className="text-center">
        <h2 className={'mb-4 text-fontcolor-muted'}>
          <InternalLink className="text-fontcolor-muted" href={urls.locationUnitedStates()}>
            United States
          </InternalLink>
          {' / '}
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
        </h2>
        <PageTitle as="h1" className="mb-4" size="md">
          {district
            ? `${stateCode} Congressional District ${district} Race`
            : `U.S. Senate Race (${stateCode})`}
        </PageTitle>
        <Button asChild className="mt-6 w-full max-w-xs">
          <TrackedExternalLink
            eventProperties={{ Category: 'Register To Vote' }}
            href={REGISTRATION_URLS_BY_STATE[stateCode].registerUrl}
          >
            Register to vote
          </TrackedExternalLink>
        </Button>
      </div>
      <section className="space-y-20">
        {recommended && (
          <div className="space-y-4">
            <h3 className="text-center text-xl font-bold">Our recommended candidate</h3>
            <h4 className="text-center text-fontcolor-muted">
              Stand With Crypto recommends {dtsiPersonFullName(recommended)} for{' '}
              {district
                ? `${stateCode} Congressional District ${district} Race`
                : `U.S. Senate Race (${stateCode})`}
              .
            </h4>
            <CandidateInfo
              isRecommended
              key={recommended.id}
              {...{ locale, person: recommended }}
            />
          </div>
        )}
        {!!others.length && (
          <div className="space-y-4">
            {recommended && (
              <>
                <h3 className="text-center text-xl font-bold">Other candidates</h3>
                <h4 className="text-center text-fontcolor-muted">
                  Feel free to check out other, less crypto forward candidates that are running.
                </h4>
              </>
            )}
            <div className="space-y-16">
              {others.map(person => (
                <DTSIPersonCard key={person.id} locale={locale} person={person} subheader="role" />
              ))}
            </div>
          </div>
        )}
      </section>
      <PACFooter />
    </div>
  )
}
