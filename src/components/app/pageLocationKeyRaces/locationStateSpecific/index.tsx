'use client'

import { useEffect } from 'react'
import { compact, isEmpty, times } from 'lodash-es'

import { actionCreateUserActionViewKeyRaces } from '@/actions/actionCreateUserActionViewKeyRaces'
import { ContentSection } from '@/components/app/ContentSection'
import { DarkHeroSection } from '@/components/app/darkHeroSection'
import { DTSIPersonHeroCardSection } from '@/components/app/dtsiPersonHeroCard/dtsiPersonHeroCardSection'
import { DTSIStanceDetails } from '@/components/app/dtsiStanceDetails'
import { PACFooter } from '@/components/app/pacFooter'
import { UserActionFormVoterRegistrationDialog } from '@/components/app/userActionFormVoterRegistration/dialog'
import { Button } from '@/components/ui/button'
import { FormattedNumber } from '@/components/ui/formattedNumber'
import { ExternalLink, InternalLink } from '@/components/ui/link'
import { PageTitle } from '@/components/ui/pageTitleText'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { DTSI_PersonStanceType, DTSI_StateSpecificInformationQuery } from '@/data/dtsi/generated'
import { US_LOCATION_PAGES_LIVE_KEY_DISTRICTS_MAP } from '@/utils/shared/locationSpecificPages'
import { COUNTRY_CODE_TO_LOCALE, SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { getIntlUrls } from '@/utils/shared/urls'
import { US_STATE_CODE_TO_DISTRICT_COUNT_MAP } from '@/utils/shared/usStateDistrictUtils'
import { getUSStateNameFromStateCode, USStateCode } from '@/utils/shared/usStateUtils'
import { cn } from '@/utils/web/cn'

import { organizeStateSpecificPeople } from './organizeStateSpecificPeople'
import { UserLocationRaceInfo } from './userLocationRaceInfo'

interface LocationStateSpecificProps extends DTSI_StateSpecificInformationQuery {
  stateCode: USStateCode
  countryCode: SupportedCountryCodes
  countAdvocates: number
}

export function LocationStateSpecific({
  stateCode,
  people,
  countryCode,
  countAdvocates,
  personStances,
}: LocationStateSpecificProps) {
  const stances = personStances.filter(x => x.stanceType === DTSI_PersonStanceType.TWEET)
  const groups = organizeStateSpecificPeople(people)
  const urls = getIntlUrls(countryCode)
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

  useEffect(() => {
    void actionCreateUserActionViewKeyRaces({
      usaState: stateCode,
    })
  }, [stateCode])

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
              <FormattedNumber
                amount={countAdvocates}
                locale={COUNTRY_CODE_TO_LOCALE[countryCode]}
              />{' '}
              crypto advocates
            </h3>
          )}
          {stateCode === 'MI' ? (
            <Button asChild className="mt-6 w-full max-w-xs" variant="secondary">
              <ExternalLink href="https://mvic.sos.state.mi.us/Voter/Index">
                Find your poll location
              </ExternalLink>
            </Button>
          ) : (
            <UserActionFormVoterRegistrationDialog initialStateCode={stateCode}>
              <Button className="mt-6 w-full max-w-xs" variant="secondary">
                Make sure you're registered to vote
              </Button>
            </UserActionFormVoterRegistrationDialog>
          )}
        </div>
      </DarkHeroSection>

      {isEmpty(groups.senators) && isEmpty(groups.congresspeople) ? (
        <PageTitle as="h3" className="mt-20" size="sm">
          There's no election data for {stateName}
        </PageTitle>
      ) : (
        <div className="space-y-20">
          {!!groups.senators.length && (
            <div className="mt-20">
              <DTSIPersonHeroCardSection
                countryCode={countryCode}
                cta={
                  <InternalLink href={urls.locationStateSpecificSenateRace(stateCode)}>
                    View Race
                  </InternalLink>
                }
                people={groups.senators}
                title={<>U.S. Senate Race ({stateCode})</>}
              />
            </div>
          )}
          {groups.congresspeople['at-large']?.people.length ? (
            <div className="mt-20">
              <DTSIPersonHeroCardSection
                countryCode={countryCode}
                cta={
                  <InternalLink
                    href={urls.locationDistrictSpecific({ stateCode, district: 'at-large' })}
                  >
                    View Race
                  </InternalLink>
                }
                people={groups.congresspeople['at-large'].people}
                title={<>At-Large Congressional District</>}
              />
            </div>
          ) : (
            <UserLocationRaceInfo
              countryCode={countryCode}
              groups={groups}
              stateCode={stateCode}
              stateName={stateName}
            />
          )}
          {!!stances.length && (
            <ContentSection
              subtitle={
                <>Keep up with recent tweets about crypto from politicians in {stateName}.</>
              }
              title={<>What politicians in {stateCode} are saying</>}
            >
              <ScrollArea>
                <div className="flex justify-center gap-5 pb-3 pl-4">
                  {stances.map(stance => {
                    return (
                      <div
                        className="flex w-[300px] shrink-0 flex-col lg:w-[500px]"
                        key={stance.id}
                      >
                        <DTSIStanceDetails
                          bodyClassName="line-clamp-6"
                          className="flex-grow"
                          countryCode={countryCode}
                          hideImages
                          person={stance.person}
                          stance={stance}
                        />
                      </div>
                    )
                  })}
                </div>
                <ScrollBar orientation="horizontal" />
              </ScrollArea>
            </ContentSection>
          )}
          {US_LOCATION_PAGES_LIVE_KEY_DISTRICTS_MAP[stateCode]?.map(district => {
            const districtPeople = groups.congresspeople[district]?.people
            if (!districtPeople) {
              return null
            }
            return (
              <DTSIPersonHeroCardSection
                countryCode={countryCode}
                cta={
                  <InternalLink href={urls.locationDistrictSpecific({ stateCode, district })}>
                    View Race
                  </InternalLink>
                }
                key={district}
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
      )}
    </div>
  )
}
