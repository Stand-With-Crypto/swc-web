'use client'

import { useMemo } from 'react'
import { compact, isEmpty, times } from 'lodash-es'

import { ContentSection } from '@/components/app/ContentSection'
import { DarkHeroSection } from '@/components/app/darkHeroSection'
import { DTSIStanceDetails } from '@/components/app/dtsiStanceDetails'
import { PACFooter } from '@/components/app/pacFooter'
import { LiveResultsGrid } from '@/components/app/pageLocationKeyRaces/liveResultsGrid'
import { KeyRaceLiveResult } from '@/components/app/pageLocationKeyRaces/locationUnitedStatesLiveResults/keyRaceLiveResult'
import {
  LiveStatusBadge,
  Status,
} from '@/components/app/pageLocationKeyRaces/locationUnitedStatesLiveResults/liveStatusBadge'
import { ResultsOverviewCard } from '@/components/app/pageLocationKeyRaces/locationUnitedStatesLiveResults/resultsOverviewCard'
import {
  getCongressLiveResultOverview,
  getRaceStatus,
} from '@/components/app/pageLocationKeyRaces/locationUnitedStatesLiveResults/utils'
import { Button } from '@/components/ui/button'
import { FormattedNumber } from '@/components/ui/formattedNumber'
import { ExternalLink, InternalLink } from '@/components/ui/link'
import { PageTitle } from '@/components/ui/pageTitleText'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import {
  GetAllCongressDataResponse,
  RacesVotingDataResponse,
} from '@/data/aggregations/decisionDesk/types'
import { DTSI_PersonStanceType, DTSI_StateSpecificInformationQuery } from '@/data/dtsi/generated'
import { useApiDecisionDeskCongressData } from '@/hooks/useApiDecisionDeskCongressData'
import { useApiDecisionDeskData } from '@/hooks/useApiDecisionDeskStateData'
import { SupportedLocale } from '@/intl/locales'
import { US_LOCATION_PAGES_LIVE_KEY_DISTRICTS_MAP } from '@/utils/shared/locationSpecificPages'
import { getIntlUrls } from '@/utils/shared/urls'
import { US_STATE_CODE_TO_DISTRICT_COUNT_MAP } from '@/utils/shared/usStateDistrictUtils'
import { getUSStateNameFromStateCode, USStateCode } from '@/utils/shared/usStateUtils'
import { cn } from '@/utils/web/cn'

import { organizeStateSpecificPeople } from './organizeStateSpecificPeople'

interface LocationStateSpecificProps extends DTSI_StateSpecificInformationQuery {
  stateCode: USStateCode
  locale: SupportedLocale
  countAdvocates: number
  initialRaceData: RacesVotingDataResponse[] | undefined
  initialCongressLiveResultData: GetAllCongressDataResponse | null
}

export function LocationStateSpecific({
  stateCode,
  people,
  locale,
  countAdvocates,
  personStances,
  initialRaceData,
  initialCongressLiveResultData,
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

  const { data: stateRaceData } = useApiDecisionDeskData({
    initialRaceData,
    stateCode,
    district: undefined,
  })

  const { data: congressRaceLiveResult } = useApiDecisionDeskCongressData(
    initialCongressLiveResultData,
  )

  const senateElectedData = getCongressLiveResultOverview(
    congressRaceLiveResult?.senateDataWithDtsi,
    stateCode,
  )
  const houseElectedData = getCongressLiveResultOverview(
    congressRaceLiveResult?.houseDataWithDtsi,
    stateCode,
  )

  const hasCriticalElections = useMemo(() => {
    const hasCriticalDistrict = US_LOCATION_PAGES_LIVE_KEY_DISTRICTS_MAP[stateCode]?.some(
      district => {
        return Boolean(groups.congresspeople[district]?.people.length)
      },
    )

    return (
      hasCriticalDistrict ||
      Boolean(groups.senators.length) ||
      Boolean(groups.congresspeople['at-large']?.people.length)
    )
  }, [groups, stateCode])

  const raceStatus = useMemo<Status>(() => getRaceStatus(stateRaceData), [stateRaceData])

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
          <h3 className="mt-4 text-xl text-gray-400">
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
              Claim I Voted NFT
            </Button>
          )}
        </div>
      </DarkHeroSection>

      {stateRaceData ? (
        <div className="mt-20 space-y-20">
          <ContentSection
            className="container"
            subtitle={`Follow our tracker to see how many pro-crypto candidates get elected in ${stateName}.`}
            title="Live election results"
            titleProps={{ size: 'xs' }}
          >
            <div className="flex justify-center">
              <LiveStatusBadge status={raceStatus} />
            </div>

            <div className="flex flex-wrap gap-4">
              <ResultsOverviewCard
                antiCryptoCandidatesElected={houseElectedData.antiCryptoCandidatesElected}
                proCryptoCandidatesElected={houseElectedData.proCryptoCandidatesElected}
                title="House of Representatives"
              />
              <ResultsOverviewCard
                antiCryptoCandidatesElected={senateElectedData.antiCryptoCandidatesElected}
                proCryptoCandidatesElected={senateElectedData.proCryptoCandidatesElected}
                title="Senate"
              />
            </div>
          </ContentSection>
        </div>
      ) : null}

      {isEmpty(groups.senators) && isEmpty(groups.congresspeople) ? (
        <PageTitle as="h3" className="mt-20" size="sm">
          There's no election data for {stateName}
        </PageTitle>
      ) : (
        <div className="mt-20 space-y-20">
          {hasCriticalElections ? (
            <ContentSection
              subtitle="These elections are critical to the future of crypto in America. View live updates below."
              title={`Critical elections in ${stateName}`}
              titleProps={{ size: 'xs' }}
            >
              <LiveResultsGrid>
                {groups.senators.length && (
                  <LiveResultsGrid.GridItem>
                    <KeyRaceLiveResult
                      candidates={groups.senators}
                      initialRaceData={initialRaceData || undefined}
                      locale={locale}
                      primaryDistrict={undefined}
                      stateCode={stateCode}
                    />
                  </LiveResultsGrid.GridItem>
                )}

                {!!groups.congresspeople['at-large']?.people.length && (
                  <LiveResultsGrid.GridItem>
                    <KeyRaceLiveResult
                      candidates={groups.congresspeople['at-large'].people}
                      initialRaceData={initialRaceData || undefined}
                      locale={locale}
                      primaryDistrict="at-large"
                      stateCode={stateCode}
                    />
                  </LiveResultsGrid.GridItem>
                )}

                {US_LOCATION_PAGES_LIVE_KEY_DISTRICTS_MAP[stateCode]?.map(district => {
                  const districtPeople = groups.congresspeople[district]?.people
                  if (!districtPeople) {
                    return null
                  }
                  return (
                    <LiveResultsGrid.GridItem key={district}>
                      <KeyRaceLiveResult
                        candidates={districtPeople}
                        initialRaceData={initialRaceData || undefined}
                        locale={locale}
                        primaryDistrict={district}
                        stateCode={stateCode}
                      />
                    </LiveResultsGrid.GridItem>
                  )
                })}
              </LiveResultsGrid>
            </ContentSection>
          ) : (
            <PageTitle as="h3" className="mt-20" size="sm">
              There's no critical elections in {stateName}
            </PageTitle>
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
