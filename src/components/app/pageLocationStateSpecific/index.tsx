import { compact, times } from 'lodash-es'

import { ContentSection } from '@/components/app/ContentSection'
import { CryptoSupportHighlight } from '@/components/app/cryptoSupportHighlight'
import { DarkHeroSection } from '@/components/app/darkHeroSection'
import { DTSIPersonHeroCardSection } from '@/components/app/dtsiPersonHeroCard/dtsiPersonHeroCardSection'
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

import { organizeStateSpecificPeople } from './organizeStateSpecificPeople'

interface LocationStateSpecificProps extends DTSI_StateSpecificInformationQuery {
  stateCode: USStateCode //test
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
    <div className="space-y-20">
      <DarkHeroSection>
        <div className="text-center">
          <h2 className={'mb-4'}>
            <InternalLink className="text-gray-400" href={urls.locationUnitedStates()}>
              United States
            </InternalLink>{' '}
            / <span className="font-bold text-purple-400">{stateName}</span>
          </h2>
          <PageTitle as="h1" className="mb-4" size="md">
            Key Races in {stateName}
          </PageTitle>
          <PageSubTitle as="h2" className="text-gray-400" size="md">
            View the races critical to keeping crypto in {stateName}.
          </PageSubTitle>
          {countAdvocates > 1000 && (
            <h3 className="mt-4 text-xl font-bold text-purple-400">
              <FormattedNumber amount={countAdvocates} locale={locale} /> crypto advocates
            </h3>
          )}
          <Button asChild className="mt-6 w-full max-w-xs" variant="secondary">
            <TrackedExternalLink
              eventProperties={{ Category: 'Register To Vote' }}
              href={REGISTRATION_URLS_BY_STATE[stateCode].registerUrl}
            >
              Register to vote
            </TrackedExternalLink>
          </Button>
        </div>
      </DarkHeroSection>
      <div className="space-y-20">
        {!!groups.senators.length && (
          <DTSIPersonHeroCardSection
            cta={
              <InternalLink href={urls.locationStateSpecificSenateRace(stateCode)}>
                View Race
              </InternalLink>
            }
            locale={locale}
            people={groups.senators}
            title={<>U.S. Senate Race ({stateCode})</>}
          />
        )}
        {groups.congresspeople['at-large']?.people.length ? (
          <DTSIPersonHeroCardSection
            cta={
              <InternalLink
                href={urls.locationDistrictSpecific({ stateCode, district: 'at-large' })}
              >
                View Race
              </InternalLink>
            }
            locale={locale}
            people={groups.congresspeople['at-large'].people}
            title={<>At-Large Congressional District</>}
          />
        ) : (
          <ContentSection
            className="bg-muted py-14"
            subtitle={
              <>
                Do you live in {stateName}? Enter your address and we’ll redirect you to races in
                your district.
              </>
            }
            title={'Your district'}
          >
            <UserLocationRaceInfo groups={groups} locale={locale} stateCode={stateCode} />
          </ContentSection>
        )}
        <ContentSection
          subtitle={<>Keep up with recent tweets about crypto from politicians in {stateName}.</>}
          title={<>What politicians in {stateCode} are saying</>}
        >
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
        </ContentSection>
        {US_LOCATION_PAGES_LIVE_KEY_DISTRICTS_MAP[stateCode]?.map(district => (
          <DTSIPersonHeroCardSection
            cta={
              <InternalLink href={urls.locationDistrictSpecific({ stateCode, district })}>
                View Race
              </InternalLink>
            }
            key={district}
            locale={locale}
            people={groups.congresspeople[district].people}
            title={<>Congressional District {district}</>}
          />
        ))}

        {US_STATE_CODE_TO_DISTRICT_COUNT_MAP[stateCode] > 1 && (
          <ContentSection
            className="container"
            subtitle={'Dive deeper and discover races in other districts.'}
            title={`Other races in ${stateName}`}
          >
            <div className="grid grid-cols-2 gap-3 text-center md:grid-cols-3">
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
          </ContentSection>
        )}

        <PACFooter className="container" />
      </div>
    </div>
  )
}
