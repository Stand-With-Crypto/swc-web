import { compact, times } from 'lodash-es'

import { ContentSection } from '@/components/app/ContentSection'
import { CryptoSupportHighlight } from '@/components/app/cryptoSupportHighlight'
import { DarkHeroSection } from '@/components/app/darkHeroSection'
import { DTSIPersonHeroCardSection } from '@/components/app/dtsiPersonHeroCard/dtsiPersonHeroCardSection'
import { DTSIStanceDetails } from '@/components/app/dtsiStanceDetails'
import { PACFooter } from '@/components/app/pacFooter'
import { UserLocationRaceInfo } from '@/components/app/pageLocationStateSpecific/userLocationRaceInfo'
import { UserActionFormVoterRegistrationDialog } from '@/components/app/userActionFormVoterRegistration/dialog'
import { Button } from '@/components/ui/button'
import { FormattedNumber } from '@/components/ui/formattedNumber'
import { InternalLink } from '@/components/ui/link'
import { PageTitle } from '@/components/ui/pageTitleText'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { DTSI_PersonStanceType, DTSI_StateSpecificInformationQuery } from '@/data/dtsi/generated'
import { SupportedLocale } from '@/intl/locales'
import { US_LOCATION_PAGES_LIVE_KEY_DISTRICTS_MAP } from '@/utils/shared/locationSpecificPages'
import { getIntlUrls } from '@/utils/shared/urls'
import { US_STATE_CODE_TO_DISTRICT_COUNT_MAP } from '@/utils/shared/usStateDistrictUtils'
import { getUSStateNameFromStateCode,USStateCode } from '@/utils/shared/usStateUtils'
import { cn } from '@/utils/web/cn'

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
      <DarkHeroSection>
        <div className="text-center">
          <h2 className={'mb-4'}>
            <InternalLink className="text-gray-400" href={urls.locationUnitedStates()}>
              United States
            </InternalLink>{' '}
            / <span>{stateName}</span>
          </h2>
          <PageTitle as="h1" className="mb-4" size="md">
            Key Races in {stateName}
          </PageTitle>
          {countAdvocates > 1000 && (
            <h3 className="mt-4 font-mono text-xl font-light">
              <FormattedNumber amount={countAdvocates} locale={locale} /> crypto advocates
            </h3>
          )}
          <UserActionFormVoterRegistrationDialog initialStateCode={stateCode}>
            <Button className="mt-6 w-full max-w-xs" variant="secondary">
              Register to vote
            </Button>
          </UserActionFormVoterRegistrationDialog>
        </div>
      </DarkHeroSection>
      <div className="space-y-20">
        {!!groups.senators.length && (
          <div className="mt-20">
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
          </div>
        )}
        {groups.congresspeople['at-large']?.people.length ? (
          <div className="mt-20">
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
          </div>
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
                  <div className="flex w-[300px] shrink-0 flex-col lg:w-[500px]" key={stance.id}>
                    <DTSIStanceDetails
                      bodyClassName="line-clamp-6"
                      className="flex-grow"
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
        {US_LOCATION_PAGES_LIVE_KEY_DISTRICTS_MAP[stateCode]?.map(district => {
          const districtPeople = groups.congresspeople[district]?.people
          if (!districtPeople) {
            return null
          }
          return (
            <DTSIPersonHeroCardSection
              cta={
                <InternalLink href={urls.locationDistrictSpecific({ stateCode, district })}>
                  View Race
                </InternalLink>
              }
              key={district}
              locale={locale}
              people={districtPeople}
              title={<>Congressional District {district}</>}
            />
          )
        })}

        {US_STATE_CODE_TO_DISTRICT_COUNT_MAP[stateCode] > 1 && (
          <ContentSection
            className="container"
            subtitle={'Dive deeper and discover races in other districts.'}
            title={`Other races in ${stateName}`}
          >
            <div className="grid grid-cols-2 gap-3 text-center md:grid-cols-3 xl:grid-cols-4">
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
