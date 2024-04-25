import { compact, times } from 'lodash-es'

import { CryptoSupportHighlight } from '@/components/app/cryptoSupportHighlight'
import { DTSIStanceDetails } from '@/components/app/dtsiStanceDetails'
import { PACFooter } from '@/components/app/pacFooter'
import { UserLocationRaceInfo } from '@/components/app/pageLocationStateSpecific/userLocationRaceInfo'
import { REGISTRATION_URLS_BY_STATE } from '@/components/app/userActionFormVoterRegistration/constants'
import { Button } from '@/components/ui/button'
import { FormattedNumber } from '@/components/ui/formattedNumber'
import { InternalLink } from '@/components/ui/link'
import { PageSubTitle } from '@/components/ui/pageSubTitle'
import { PageTitle } from '@/components/ui/pageTitleText'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { TrackedExternalLink } from '@/components/ui/trackedExternalLink'
import { DTSI_PersonStanceType, DTSI_StateSpecificInformationQuery } from '@/data/dtsi/generated'
import { SupportedLocale } from '@/intl/locales'
import { US_LOCATION_PAGES_LIVE_KEY_DISTRICTS_MAP } from '@/utils/shared/locationSpecificPages'
import { getIntlUrls } from '@/utils/shared/urls'
import { US_STATE_CODE_TO_DISTRICT_COUNT_MAP } from '@/utils/shared/usStateDistrictUtils'
import { getUSStateNameFromStateCode, USStateCode } from '@/utils/shared/usStateUtils'
import { cn } from '@/utils/web/cn'

import { LocationSpecificRaceInfo } from './locationSpecificRaceInfo'
import { organizeStateSpecificPeople } from './organizeStateSpecificPeople'

interface LocationStateSpecificProps extends DTSI_StateSpecificInformationQuery {
  stateCode: USStateCode
  locale: SupportedLocale
  countAdvocates: number
}

export function LocationStateSpecific({
  stateCode,
  people,
  locale,
  countAdvocates,
  personStances,
}: LocationStateSpecificProps) {
  const stances = personStances.filter(x => x.stanceType === DTSI_PersonStanceType.TWEET)
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
    <div>
      <div className="container mb-20 max-w-4xl text-center">
        <h2 className={'mb-4'}>
          <InternalLink className="text-fontcolor-muted" href={urls.locationUnitedStates()}>
            United States
          </InternalLink>{' '}
          / <span className="font-bold text-primary-cta">{stateName}</span>
        </h2>
        <PageTitle as="h1" size="md">
          Key Races in {stateName}
        </PageTitle>
        {countAdvocates > 1000 && (
          <h3 className="mt-4 text-xl font-bold text-primary-cta">
            <FormattedNumber amount={countAdvocates} locale={locale} /> crypto advocates
          </h3>
        )}
        <Button asChild className="mt-6 w-full max-w-xs">
          <TrackedExternalLink
            eventProperties={{ Category: 'Register To Vote' }}
            href={REGISTRATION_URLS_BY_STATE[stateCode].registerUrl}
          >
            Register to vote
          </TrackedExternalLink>
        </Button>
      </div>
      <div className="container max-w-4xl divide-y-2 *:py-20 first:*:pt-0 last:*:pb-0">
        {!!groups.senators.length && (
          <LocationSpecificRaceInfo
            candidates={groups.senators}
            locale={locale}
            title={<>U.S Senate Race ({stateCode})</>}
            url={urls.locationStateSpecificSenateRace(stateCode)}
          />
        )}

        {groups.congresspeople['at-large']?.people.length ? (
          <LocationSpecificRaceInfo
            candidates={groups.congresspeople['at-large'].people}
            locale={locale}
            title={<>At-Large Congressional District</>}
            url={urls.locationDistrictSpecific({ stateCode, district: 'at-large' })}
          />
        ) : (
          <UserLocationRaceInfo groups={groups} locale={locale} stateCode={stateCode} />
        )}
        {/* Because we want the recent tweets to be full length we cant use the divider classes above, but we still want a divider so we add this empty div */}
        {!!stances.length && <div />}
      </div>
      {!!stances.length && (
        <div>
          <div className="container mb-8">
            <PageTitle as="h3" size="sm">
              What politicians in {stateCode} are saying
            </PageTitle>
            <PageSubTitle as="h4" size="sm">
              Keep up with recent tweets about crypto from politicians in {stateName}.
            </PageSubTitle>
          </div>
          <ScrollArea>
            <div className="flex justify-center gap-5 pb-3 pl-4">
              {stances.map(stance => {
                return (
                  <div className="w-[300px] shrink-0 lg:w-[500px]" key={stance.id}>
                    <DTSIStanceDetails
                      bodyClassName="line-clamp-6"
                      hideImages
                      locale={locale}
                      person={stance.person}
                      stance={stance}
                    />
                    <CryptoSupportHighlight
                      className="mx-auto mt-2"
                      stanceScore={stance.computedStanceScore}
                    />
                  </div>
                )
              })}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </div>
      )}
      <div className="container max-w-4xl divide-y-2 *:py-20 first:*:pt-0 last:*:pb-0">
        {/* Because we want the recent tweets to be full length we cant use the divider classes above, but we still want a divider so we add this empty div */}
        {!!stances.length && <div />}
        {US_LOCATION_PAGES_LIVE_KEY_DISTRICTS_MAP[stateCode]?.map(district => (
          <LocationSpecificRaceInfo
            candidates={groups.congresspeople[district].people}
            key={district}
            locale={locale}
            title={<>Congressional District {district}</>}
            url={urls.locationDistrictSpecific({ stateCode, district })}
          />
        ))}
        {US_STATE_CODE_TO_DISTRICT_COUNT_MAP[stateCode] > 1 && (
          <div>
            <section className="space-y-10">
              <PageTitle as="h3" className="mb-3" size="sm">
                Other races in {stateName}
              </PageTitle>
              <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:text-center">
                {otherDistricts.map(district => (
                  <InternalLink
                    className={cn('mb-4 block flex-shrink-0 font-semibold')}
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
      <PACFooter />
    </div>
  )
}
