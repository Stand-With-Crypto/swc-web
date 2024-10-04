'use client'

import { useEffect } from 'react'
import { compact, isEmpty, times } from 'lodash-es'

import { actionCreateUserActionViewKeyRaces } from '@/actions/actionCreateUserActionViewKeyRaces'
import { ContentSection } from '@/components/app/ContentSection'
import { DarkHeroSection } from '@/components/app/darkHeroSection'
import { DTSIPersonHeroCardSection } from '@/components/app/dtsiPersonHeroCard/dtsiPersonHeroCardSection'
import { DTSIStanceDetails } from '@/components/app/dtsiStanceDetails'
import { PACFooter } from '@/components/app/pacFooter'
import { LiveResultsGrid } from '@/components/app/pageLocationKeyRaces/liveResultsGrid'
import { LiveStatusBadge } from '@/components/app/pageLocationKeyRaces/locationUnitedStatesLiveResults/liveStatusBadge'
import { ResultsOverviewCard } from '@/components/app/pageLocationKeyRaces/locationUnitedStatesLiveResults/resultsOverviewCard'
import { Button } from '@/components/ui/button'
import { FormattedNumber } from '@/components/ui/formattedNumber'
import { NextImage } from '@/components/ui/image'
import { ExternalLink, InternalLink } from '@/components/ui/link'
import { PageTitle } from '@/components/ui/pageTitleText'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { DTSI_PersonStanceType, DTSI_StateSpecificInformationQuery } from '@/data/dtsi/generated'
import { SupportedLocale } from '@/intl/locales'
import { GetRacesResponse } from '@/utils/server/decisionDesk/types'
import { US_LOCATION_PAGES_LIVE_KEY_DISTRICTS_MAP } from '@/utils/shared/locationSpecificPages'
import { getIntlUrls } from '@/utils/shared/urls'
import { US_STATE_CODE_TO_DISTRICT_COUNT_MAP } from '@/utils/shared/usStateDistrictUtils'
import { getUSStateNameFromStateCode, USStateCode } from '@/utils/shared/usStateUtils'
import { cn } from '@/utils/web/cn'

import { organizeStateSpecificPeople } from './organizeStateSpecificPeople'
import { UserLocationRaceInfo } from './userLocationRaceInfo'

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

  // const { data } = useApiDecisionDeskRaces({} as GetRacesResponse, {
  //   race_date: '2024-11-05',
  //   state: stateCode,
  // })

  const data = {} as GetRacesResponse

  console.log('DecisionDesk Data: ', {
    stateName,
    data,
  })

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
          <h3 className="mt-4 text-xl text-fontcolor-muted">
            View the races critical to keeping crypto in {stateName}.
          </h3>
          {countAdvocates > 1000 && (
            <h3 className="mt-4 font-mono text-xl font-light">
              <FormattedNumber amount={countAdvocates} locale={locale} /> crypto advocates
            </h3>
          )}
          {stateCode === 'MI' ? (
            <Button asChild className="mt-6 w-full max-w-xs" variant="secondary">
              <ExternalLink href="https://mvic.sos.state.mi.us/Voter/Index">
                Find your poll location
              </ExternalLink>
            </Button>
          ) : (
            <Button className="mt-6 w-full max-w-xs md:w-fit" variant="secondary">
              I voted
            </Button>
          )}
        </div>
      </DarkHeroSection>

      <div className="mt-20 space-y-20">
        <ContentSection
          className="container"
          subtitle={`Follow our tracker to see how many pro-crypto candidates get elected in ${stateName}.`}
          title="Live election results"
          titleProps={{ size: 'xs' }}
        >
          <div className="flex justify-center">
            <LiveStatusBadge status="live" />
          </div>

          <div className="flex flex-wrap gap-4">
            <ResultsOverviewCard
              antiCryptoCandidatesElected={999}
              proCryptoCandidatesElected={999}
              title="House of Representatives"
            />
            <ResultsOverviewCard
              antiCryptoCandidatesElected={999}
              proCryptoCandidatesElected={999}
              title="Senate"
            />
          </div>
        </ContentSection>

        <ContentSection
          subtitle="These elections are critical to the future of crypto in America. View live updates below."
          title={`Critical elections in ${stateName}`}
          titleProps={{ size: 'xs' }}
        >
          <LiveResultsGrid>
            <LiveResultsGrid.GridItem>
              <div className="flex flex-col items-center justify-center gap-8 text-center">
                <NextImage
                  alt="SWC shield"
                  height={120}
                  src="/shields/shield_DoublePurple.png"
                  width={120}
                />
                <div className="space-y-2">
                  <p className="text-xl font-semibold">Did you vote in this year's election?</p>
                  <p className="text-fontcolor-muted">Claim your free "I Voted" NFT</p>
                </div>
                <Button className="w-fit">I voted!</Button>
              </div>
            </LiveResultsGrid.GridItem>
          </LiveResultsGrid>
        </ContentSection>
      </div>

      {isEmpty(groups.senators) && isEmpty(groups.congresspeople) ? (
        <PageTitle as="h3" className="mt-20" size="sm">
          There's no election data for {stateName}
        </PageTitle>
      ) : (
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
            <UserLocationRaceInfo
              groups={groups}
              locale={locale}
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
                          hideImages
                          locale={locale}
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
      )}
    </div>
  )
}
