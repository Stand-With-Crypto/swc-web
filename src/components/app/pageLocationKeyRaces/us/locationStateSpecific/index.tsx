'use client'

import { useEffect, useMemo } from 'react'
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
import { ResponsiveTabsOrSelect } from '@/components/ui/responsiveTabsOrSelect'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import {
  DTSI_PersonPoliticalAffiliationCategory,
  DTSI_PersonStanceType,
  DTSI_StateSpecificInformationQuery,
} from '@/data/dtsi/generated'
import { US_LOCATION_PAGES_LIVE_KEY_DISTRICTS_MAP } from '@/utils/shared/locationSpecificPages'
import { US_STATE_CODE_TO_DISTRICT_COUNT_MAP } from '@/utils/shared/stateMappings/usStateDistrictUtils'
import { getUSStateNameFromStateCode, USStateCode } from '@/utils/shared/stateMappings/usStateUtils'
import { COUNTRY_CODE_TO_LOCALE, SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { getIntlUrls } from '@/utils/shared/urls'
import { USUserActionViewKeyRacesCampaignName } from '@/utils/shared/userActionCampaigns/us/usUserActionCampaigns'
import { cn } from '@/utils/web/cn'

import { organizeStateSpecificPeople } from './organizeStateSpecificPeople'
import { UserLocationRaceInfo } from './userLocationRaceInfo'

interface LocationStateSpecificProps extends DTSI_StateSpecificInformationQuery {
  stateCode: USStateCode
  countAdvocates: number
}

const countryCode = SupportedCountryCodes.US

export function USLocationStateSpecific({
  stateCode,
  congress,
  governor,
  countAdvocates,
}: LocationStateSpecificProps) {
  const stances = congress
    .flatMap(x => x.stances)
    .filter(x => x.stanceType === DTSI_PersonStanceType.TWEET)
  const groups = organizeStateSpecificPeople(congress, governor)
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
      campaignName: USUserActionViewKeyRacesCampaignName['H1_2025'],
      usaState: stateCode,
    })
  }, [stateCode])

  const republicanGovernors = useMemo(
    () =>
      groups.governors.filter(
        x => x.politicalAffiliationCategory === DTSI_PersonPoliticalAffiliationCategory.REPUBLICAN,
      ),
    [groups.governors],
  )
  const democraticGovernors = useMemo(
    () =>
      groups.governors.filter(
        x => x.politicalAffiliationCategory === DTSI_PersonPoliticalAffiliationCategory.DEMOCRAT,
      ),
    [groups.governors],
  )

  return (
    <div>
      <DarkHeroSection>
        <div className="text-center">
          <h2 className={'mb-4'}>
            <InternalLink className="text-gray-400" href={urls.locationKeyRaces()}>
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

      {isEmpty(groups.senators) && isEmpty(groups.congresspeople) && isEmpty(groups.governors) ? (
        <PageTitle as="h3" className="mt-20" size="sm">
          There's no key races currently in {stateName}
        </PageTitle>
      ) : (
        <div className="space-y-20">
          {!!groups.governors && (
            <div className="mt-20">
              <ResponsiveTabsOrSelect
                analytics={'Primary Races Tabs'}
                containerClassName="mb-6 md:mb-10 w-full"
                data-testid="primary-races-tabs"
                defaultValue={DTSI_PersonPoliticalAffiliationCategory.REPUBLICAN}
                forceDesktop
                options={[
                  {
                    value: DTSI_PersonPoliticalAffiliationCategory.REPUBLICAN,
                    label: 'Republican',
                    content: (
                      <div className="sticky top-24 text-center">
                        <DTSIPersonHeroCardSection
                          countryCode={countryCode}
                          cta={
                            <InternalLink href={urls.locationStateSpecificGovernorRace(stateCode)}>
                              View Race
                            </InternalLink>
                          }
                          people={republicanGovernors}
                          title={<>{stateName} Gubernatorial Election</>}
                        />
                      </div>
                    ),
                  },
                  {
                    value: DTSI_PersonPoliticalAffiliationCategory.DEMOCRAT,
                    label: 'Democratic',
                    content: (
                      <div className="sticky top-24 text-center">
                        <DTSIPersonHeroCardSection
                          countryCode={countryCode}
                          cta={
                            <InternalLink href={urls.locationStateSpecificGovernorRace(stateCode)}>
                              View Race
                            </InternalLink>
                          }
                          people={democraticGovernors}
                          title={<>{stateName} Gubernatorial Election</>}
                        />
                      </div>
                    ),
                  },
                ]}
                persistCurrentTab
              />
            </div>
          )}
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
            <UserLocationRaceInfo groups={groups} stateCode={stateCode} stateName={stateName} />
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
