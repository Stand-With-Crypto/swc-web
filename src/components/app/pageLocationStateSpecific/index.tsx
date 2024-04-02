import { compact, times } from 'lodash-es'

import { UserLocationRaceInfo } from '@/components/app/pageLocationStateSpecific/userLocationRaceInfo'
import { REGISTRATION_URLS_BY_STATE } from '@/components/app/userActionFormVoterRegistration/constants'
import { Button } from '@/components/ui/button'
import { uppercaseSectionHeader } from '@/components/ui/classUtils'
import { InternalLink } from '@/components/ui/link'
import { PageTitle } from '@/components/ui/pageTitleText'
import { TrackedExternalLink } from '@/components/ui/trackedExternalLink'
import { DTSI_StateSpecificInformationQuery } from '@/data/dtsi/generated'
import { SupportedLocale } from '@/intl/locales'
import { US_LOCATION_PAGES_LIVE_KEY_DISTRICTS_MAP } from '@/utils/shared/locationSpecificPages'
import { pluralize } from '@/utils/shared/pluralize'
import { getIntlUrls } from '@/utils/shared/urls'
import { US_STATE_CODE_TO_DISTRICT_COUNT_MAP } from '@/utils/shared/usStateDistrictUtils'
import { getUSStateNameFromStateCode, USStateCode } from '@/utils/shared/usStateUtils'
import { cn } from '@/utils/web/cn'

import { LocationSpecificRaceInfo } from './locationSpecificRaceInfo'
import { organizeStateSpecificPeople } from './organizeStateSpecificPeople'

interface LocationStateSpecificProps extends DTSI_StateSpecificInformationQuery {
  stateCode: USStateCode
  locale: SupportedLocale
}

export function LocationStateSpecific({ stateCode, people, locale }: LocationStateSpecificProps) {
  const groups = organizeStateSpecificPeople(people)
  const urls = getIntlUrls(locale)
  const stateName = getUSStateNameFromStateCode(stateCode)
  const otherDistricts = compact(
    times(US_STATE_CODE_TO_DISTRICT_COUNT_MAP[stateCode]).map(districtIndex => {
      const district = districtIndex + 1
      if (US_LOCATION_PAGES_LIVE_KEY_DISTRICTS_MAP[stateCode]?.includes(district)) {
        return null
      }
      return district
    }),
  )
  return (
    <div className="container space-y-20">
      <div className="flex flex-col text-left sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className={cn(uppercaseSectionHeader, 'mb-6 md:mb-10')}>Crypto Voter Guide</h1>
          <PageTitle as="h2" className="mb-6 text-left sm:mb-0 sm:text-center" size="md">
            {stateName}
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
            locale={locale}
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
            locale={locale}
            subtitle="Congressional Race"
            title={<>At-Large District</>}
            url={urls.locationDistrictSpecific({ stateCode, district: 'at-large' })}
          />
        ) : (
          <UserLocationRaceInfo groups={groups} locale={locale} stateCode={stateCode} />
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
            locale={locale}
            subtitle="Key Race"
            title={<>Congressional District {district}</>}
            url={urls.locationDistrictSpecific({ stateCode, district })}
          />
        ))}
        {US_STATE_CODE_TO_DISTRICT_COUNT_MAP[stateCode] > 1 && (
          <div>
            <section className="space-y-10">
              <h3 className={cn(uppercaseSectionHeader, 'mb-3')}>Other races in {stateName}</h3>
              <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                {otherDistricts.map(district => (
                  <InternalLink
                    className={cn('mb-4 block w-1/3 flex-shrink-0 font-semibold')}
                    href={urls.locationDistrictSpecific({
                      stateCode,
                      district,
                    })}
                    key={district}
                  >
                    District {district}
                  </InternalLink>
                ))}
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  )
}
