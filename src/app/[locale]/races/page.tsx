import * as Sentry from '@sentry/nextjs'
import { Metadata } from 'next'

import { LocationUnitedStatesLiveResults } from '@/components/app/pageLocationKeyRaces/locationUnitedStatesLiveResults'
import { organizePeople } from '@/components/app/pageLocationKeyRaces/locationUnitedStatesLiveResults/organizePeople'
import { PresidentialDataWithVotingResponse } from '@/data/aggregations/decisionDesk/types'
import { queryDTSILocationUnitedStatesInformation } from '@/data/dtsi/queries/queryDTSILocationUnitedStatesInformation'
import { PageProps } from '@/types'
import { getDecisionDataFromRedis } from '@/utils/server/decisionDesk/cachedData'
import { GetRacesResponse } from '@/utils/server/decisionDesk/types'
import { generateMetadataDetails } from '@/utils/server/metadataUtils'
import { SECONDS_DURATION } from '@/utils/shared/seconds'
import { toBool } from '@/utils/shared/toBool'

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

  const racesDataMap: Record<string, GetRacesResponse> = {}

  let presidentialRaceData: PresidentialDataWithVotingResponse | null = null
  try {
    presidentialRaceData =
      await getDecisionDataFromRedis<PresidentialDataWithVotingResponse>('PRESIDENTIAL_RACES_DATA')
  } catch (error) {
    Sentry.captureException(error, {
      extra: { key: 'presidential' },
    })
    console.log(`Error fetching presidential race data:`, error)
    presidentialRaceData = null
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
