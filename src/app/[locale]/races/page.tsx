import * as Sentry from '@sentry/nextjs'
import { Metadata } from 'next'

import { LocationUnitedStatesLiveResults } from '@/components/app/pageLocationKeyRaces/locationUnitedStatesLiveResults'
import { organizePeople } from '@/components/app/pageLocationKeyRaces/locationUnitedStatesLiveResults/organizePeople'
import { RacesVotingDataResponse } from '@/data/aggregations/decisionDesk/getAllRacesData'
import { PresidentialDataWithVotingResponse } from '@/data/aggregations/decisionDesk/types'
import { queryDTSILocationUnitedStatesInformation } from '@/data/dtsi/queries/queryDTSILocationUnitedStatesInformation'
import { PageProps } from '@/types'
import {
  DecisionDeskRedisKeys,
  getDecisionDataFromRedis,
} from '@/utils/server/decisionDesk/cachedData'
import { generateMetadataDetails } from '@/utils/server/metadataUtils'
import { SECONDS_DURATION } from '@/utils/shared/seconds'
import { toBool } from '@/utils/shared/toBool'
import { USStateCode } from '@/utils/shared/usStateUtils'

export const dynamic = 'error'
export const dynamicParams = toBool(process.env.MINIMIZE_PAGE_PRE_GENERATION)
export const revalidate = SECONDS_DURATION['5_MINUTES']

type LocationUnitedStatesPageProps = PageProps

export async function generateMetadata(): Promise<Metadata> {
  const title = 'Who will defend crypto in America?'
  const description =
    'View live election results on for U.S. Senate Race (CA) on Stand With Crypto.'
  return generateMetadataDetails({
    title,
    description,
  })
}

export default async function LocationUnitedStatesPage({ params }: LocationUnitedStatesPageProps) {
  const { locale } = params
  const [dtsiResults] = await Promise.all([queryDTSILocationUnitedStatesInformation()])

  const races = organizePeople(dtsiResults)

  const racesDataMap: Record<DecisionDeskRedisKeys, RacesVotingDataResponse[] | null> =
    {} as Record<DecisionDeskRedisKeys, RacesVotingDataResponse[] | null>
  const racesPromises = Object.entries(races.keyRaces).flatMap(async ([stateCode]) => {
    const key: DecisionDeskRedisKeys = `${stateCode?.toUpperCase() as USStateCode}_STATE_RACES_DATA`

    const data = await getDecisionDataFromRedis<RacesVotingDataResponse[]>(key)
    racesDataMap[key] = data
  })

  await Promise.all(racesPromises)

  let presidentialRaceData: PresidentialDataWithVotingResponse | null = null
  try {
    presidentialRaceData =
      await getDecisionDataFromRedis<PresidentialDataWithVotingResponse>('PRESIDENTIAL_RACES_DATA')
  } catch (error) {
    Sentry.captureException(error, {
      extra: { key: 'presidential' },
    })
    throw error
  }

  return (
    <LocationUnitedStatesLiveResults
      ddhqResults={racesDataMap}
      locale={locale}
      presidentialRaceData={presidentialRaceData}
      races={races}
    />
  )
}
