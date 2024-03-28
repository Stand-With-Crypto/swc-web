import { compact, times } from 'lodash-es'

import { UserLocationRaceInfo } from '@/components/app/pageLocationStateSpecific/UserLocationRaceInfo'
import { REGISTRATION_URLS_BY_STATE } from '@/components/app/userActionFormVoterRegistration/constants'
import { Button } from '@/components/ui/button'
import { uppercaseSectionHeader } from '@/components/ui/classUtils'
import { ExternalLink, InternalLink } from '@/components/ui/link'
import { PageTitle } from '@/components/ui/pageTitleText'
import { DTSI_StateSpecificInformationQuery } from '@/data/dtsi/generated'
import { SupportedLocale } from '@/intl/locales'
import { US_LOCATION_PAGES_LIVE_KEY_DISTRICTS_MAP } from '@/utils/shared/locationSpecificPages'
import { pluralize } from '@/utils/shared/pluralize'
import { getIntlUrls } from '@/utils/shared/urls'
import { US_STATE_CODE_TO_DISTRICT_COUNT_MAP } from '@/utils/shared/usStateDistrictUtils'
import { getUSStateNameFromStateCode, USStateCode } from '@/utils/shared/usStateUtils'
import { cn } from '@/utils/web/cn'

import { LocationSpecificRaceInfo } from './locationSpecificRaceInfox'
import { organizeStateSpecificPeople } from './organizeStateSpecificPeople'

interface LocationStateSpecificProps extends DTSI_StateSpecificInformationQuery {
  stateCode: USStateCode
  locale: SupportedLocale
}

export function LocationStateSpecific({ stateCode, people, locale }: LocationStateSpecificProps) {
  const groups = organizeStateSpecificPeople(people)
  const urls = getIntlUrls(locale)
  const stateName = getUSStateNameFromStateCode(stateCode)
  return (
    <div className="container space-y-20">
      <div className="text-center">
        <h1 className={cn(uppercaseSectionHeader, 'mb-4')}>Crypto Voter Guide</h1>
        <PageTitle as="h2" className="mb-6">
          {stateName}
        </PageTitle>
        <Button asChild>
          <ExternalLink href={REGISTRATION_URLS_BY_STATE[stateCode].registerUrl}>
            Register to vote
          </ExternalLink>
        </Button>
      </div>
      <div className="divide-y-2 *:py-20 first:*:pt-0 last:*:pb-0">
        {(!!groups.runningFor.senators.incumbents.length ||
          !!groups.runningFor.senators.candidates.length) && (
          <LocationSpecificRaceInfo
            candidateSections={compact([
              groups.runningFor.senators.incumbents.length
                ? {
                    title: pluralize({
                      count: groups.runningFor.senators.incumbents.length,
                      singular: 'Incumbent',
                      plural: 'Incumbents',
                    }),
                    people: groups.runningFor.senators.incumbents,
                  }
                : null,
              groups.runningFor.senators.candidates.length
                ? {
                    title: pluralize({
                      count: groups.runningFor.senators.candidates.length,
                      singular: 'Candidate',
                      plural: 'Candidates',
                    }),
                    people: groups.runningFor.senators.candidates,
                  }
                : null,
            ])}
            subtitle="Key Race"
            title={<>U.S Senate ({stateCode})</>}
            url={urls.locationStateSpecificSenateRace(stateCode)}
          />
        )}

        {!!groups.runningFor.congresspeople['at-large']?.incumbents.length ||
        !!groups.runningFor.congresspeople['at-large']?.candidates.length ? (
          <LocationSpecificRaceInfo
            candidateSections={compact([
              groups.runningFor.congresspeople['at-large']?.incumbents.length
                ? {
                    title: pluralize({
                      count: groups.runningFor.congresspeople['at-large']?.incumbents.length,
                      singular: 'Incumbent',
                      plural: 'Incumbents',
                    }),
                    people: groups.runningFor.congresspeople['at-large']?.incumbents,
                  }
                : null,
              groups.runningFor.congresspeople['at-large']?.candidates.length
                ? {
                    title: pluralize({
                      count: groups.runningFor.congresspeople['at-large']?.candidates.length,
                      singular: 'Candidate',
                      plural: 'Candidates',
                    }),
                    people: groups.runningFor.congresspeople['at-large']?.candidates,
                  }
                : null,
            ])}
            subtitle="Congressional Race"
            title={<>At-Large District</>}
            url={urls.locationDistrictSpecific({ stateCode, district: 'at-large' })}
          />
        ) : (
          <UserLocationRaceInfo groups={groups} stateCode={stateCode} />
        )}
        {US_LOCATION_PAGES_LIVE_KEY_DISTRICTS_MAP[stateCode]?.map(district => (
          <LocationSpecificRaceInfo
            candidateSections={compact([
              groups.runningFor.congresspeople[district]?.incumbents.length
                ? {
                    title: pluralize({
                      count: groups.runningFor.congresspeople[district]?.incumbents.length,
                      singular: 'Incumbent',
                      plural: 'Incumbents',
                    }),
                    people: groups.runningFor.congresspeople[district]?.incumbents,
                  }
                : null,
              groups.runningFor.congresspeople[district]?.candidates.length
                ? {
                    title: pluralize({
                      count: groups.runningFor.congresspeople[district]?.candidates.length,
                      singular: 'Candidate',
                      plural: 'Candidates',
                    }),
                    people: groups.runningFor.congresspeople[district]?.candidates,
                  }
                : null,
            ])}
            key={district}
            subtitle="Key Race"
            title={<>Congressional District {district}</>}
            url={urls.locationDistrictSpecific({ stateCode, district })}
          />
        ))}
        {US_STATE_CODE_TO_DISTRICT_COUNT_MAP[stateCode] > 1 && (
          <div>
            <section className="mx-auto max-w-2xl space-y-10">
              <h3 className={cn(uppercaseSectionHeader, 'mb-3')}>Other races in {stateName}</h3>
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                {compact(
                  times(US_STATE_CODE_TO_DISTRICT_COUNT_MAP[stateCode]).map(districtIndex => {
                    const district = districtIndex + 1

                    return (
                      <InternalLink
                        className="block"
                        href={urls.locationDistrictSpecific({
                          stateCode,
                          district,
                        })}
                        key={districtIndex}
                      >
                        District {district}
                      </InternalLink>
                    )
                  }),
                )}
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  )
}
