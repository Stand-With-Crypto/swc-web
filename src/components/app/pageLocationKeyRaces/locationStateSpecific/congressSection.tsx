'use client'

import { useMemo } from 'react'

import { ContentSection } from '@/components/app/ContentSection'
import {
  LiveStatusBadge,
  RaceStatus,
} from '@/components/app/pageLocationKeyRaces/locationUnitedStatesLiveResults/liveStatusBadge'
import { ResultsOverviewCard } from '@/components/app/pageLocationKeyRaces/locationUnitedStatesLiveResults/resultsOverviewCard'
import {
  getCongressLiveResultOverview,
  getRaceStatus,
} from '@/components/app/pageLocationKeyRaces/locationUnitedStatesLiveResults/utils'
import {
  GetAllCongressDataResponse,
  RacesVotingDataResponse,
} from '@/data/aggregations/decisionDesk/types'
import { useApiDecisionDeskCongressData } from '@/hooks/useApiDecisionDeskCongressData'
import { useApiDecisionDeskData } from '@/hooks/useApiDecisionDeskStateData'
import { SupportedLocale } from '@/intl/locales'
import { getIntlUrls } from '@/utils/shared/urls'
import { USStateCode } from '@/utils/shared/usStateUtils'

interface CongressSectionProps {
  stateCode: USStateCode
  stateName: string
  initialRaceData: RacesVotingDataResponse[] | undefined
  initialCongressLiveResultData: GetAllCongressDataResponse
  locale: SupportedLocale
}

export function CongressSection(props: CongressSectionProps) {
  const { stateCode, stateName, initialCongressLiveResultData, initialRaceData, locale } = props

  const { data: stateRaceData } = useApiDecisionDeskData({
    initialRaceData,
    stateCode,
    district: undefined,
  })
  const raceStatus = useMemo<RaceStatus>(() => getRaceStatus(stateRaceData), [stateRaceData])

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

  return (
    <ContentSection
      className="container"
      subtitle={`Follow our tracker to see how many pro-crypto candidates get elected in ${stateName}.`}
      title="Live election results"
      titleProps={{ size: 'xs' }}
    >
      <div className="flex justify-center">
        <LiveStatusBadge status={raceStatus} />
      </div>

      <div className="flex flex-col flex-wrap items-center gap-4 lg:flex-row">
        <ResultsOverviewCard
          antiCryptoCandidatesElected={houseElectedData.antiCryptoCandidatesElected.length}
          link={getIntlUrls(locale).locationCongressHouse()}
          proCryptoCandidatesElected={houseElectedData.proCryptoCandidatesElected.length}
          title="House of Representatives"
        />
        <ResultsOverviewCard
          antiCryptoCandidatesElected={senateElectedData.antiCryptoCandidatesElected.length}
          link={getIntlUrls(locale).locationCongressSenate()}
          proCryptoCandidatesElected={senateElectedData.proCryptoCandidatesElected.length}
          title="Senate"
        />
      </div>
    </ContentSection>
  )
}
