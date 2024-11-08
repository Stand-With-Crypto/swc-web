'use client'

import { useMemo } from 'react'

import { ContentSection } from '@/components/app/ContentSection'
import { LiveResultsGrid } from '@/components/app/pageLocationKeyRaces/liveResultsGrid'
import { organizeStateSpecificPeople } from '@/components/app/pageLocationKeyRaces/locationStateSpecific/organizeStateSpecificPeople'
import { KeyRaceLiveResult } from '@/components/app/pageLocationKeyRaces/locationUnitedStatesLiveResults/LiveResultCard/keyRaceLiveResultCard'
import { PageTitle } from '@/components/ui/pageTitleText'
import { RacesVotingDataResponse } from '@/data/aggregations/decisionDesk/types'
import { SupportedLocale } from '@/intl/locales'
import { US_LOCATION_PAGES_LIVE_KEY_DISTRICTS_MAP } from '@/utils/shared/locationSpecificPages'
import { USStateCode } from '@/utils/shared/usStateUtils'

interface CriticalElectionsSectionProps {
  stateCode: USStateCode
  stateName: string
  groups: ReturnType<typeof organizeStateSpecificPeople>
  initialRaceData: RacesVotingDataResponse[] | undefined
  locale: SupportedLocale
}

export function CriticalElectionsSection(props: CriticalElectionsSectionProps) {
  const { stateCode, stateName, groups, initialRaceData, locale } = props

  const { hasCriticalElections, criticalElectionsCount } = useMemo(() => {
    const criticalDistricts =
      US_LOCATION_PAGES_LIVE_KEY_DISTRICTS_MAP[stateCode]?.filter(district =>
        Boolean(groups.congresspeople[district]?.people.length),
      ) || []

    const criticalSenatorsCount = groups.senators.length ? 1 : 0
    const criticalAtLargeCount = groups.congresspeople['at-large']?.people.length ? 1 : 0

    const hasCriticalDistrict = criticalDistricts.length > 0
    const hasCriticalElections =
      hasCriticalDistrict || criticalSenatorsCount > 0 || criticalAtLargeCount > 0

    const criticalElectionsCount =
      criticalDistricts.length + criticalSenatorsCount + criticalAtLargeCount

    return { hasCriticalElections, criticalElectionsCount }
  }, [groups, stateCode])

  if (!hasCriticalElections) {
    return (
      <PageTitle as="h3" size="md">
        There's no critical elections in {stateName}
      </PageTitle>
    )
  }

  return (
    <ContentSection
      subtitle="These elections are critical to the future of crypto in America. View live updates below."
      title={`Critical elections in ${stateName}`}
    >
      <LiveResultsGrid
        className={criticalElectionsCount === 1 ? 'flex items-center justify-center' : ''}
      >
        {!!groups.senators.length && (
          <LiveResultsGrid.GridItem
            className={
              criticalElectionsCount === 1
                ? 'items-center justify-center last:!border-r-0 lg:odd:justify-center'
                : ''
            }
          >
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
          <LiveResultsGrid.GridItem
            className={
              criticalElectionsCount === 1
                ? 'items-center justify-center last:!border-r-0 lg:odd:justify-center'
                : ''
            }
          >
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
            <LiveResultsGrid.GridItem
              className={
                criticalElectionsCount === 1
                  ? 'items-center justify-center last:!border-r-0 lg:odd:justify-center'
                  : ''
              }
              key={district}
            >
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
  )
}
