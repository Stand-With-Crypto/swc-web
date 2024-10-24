import * as Sentry from '@sentry/nextjs'
import { Metadata } from 'next'

import { LocationRaceSpecific } from '@/components/app/pageLocationKeyRaces/locationRaceSpecific'
import { PresidentialDataWithVotingResponse } from '@/data/aggregations/decisionDesk/types'
import { queryDTSILocationUnitedStatesPresidential } from '@/data/dtsi/queries/queryDTSILocationUnitedStatesPresidentialInformation'
import { PageProps } from '@/types'
import { getDecisionDataFromRedis } from '@/utils/server/decisionDesk/cachedData'
import { SECONDS_DURATION } from '@/utils/shared/seconds'

export const dynamic = 'error'
export const revalidate = SECONDS_DURATION['MINUTE']

type LocationPresidentialRaceSpecificPageProps = PageProps

export async function generateMetadata(): Promise<Metadata> {
  const title = `US Presidential Race`
  const description = `See where politicians running for the US presidency stand on crypto.`
  return {
    title,
    description,
  }
}

export default async function LocationPresidentialSpecificPage({
  params,
}: LocationPresidentialRaceSpecificPageProps) {
  const { locale } = params

  const data = await queryDTSILocationUnitedStatesPresidential()

  let presidentialRaceLiveResult: PresidentialDataWithVotingResponse[] | null = null
  try {
    presidentialRaceLiveResult = await getDecisionDataFromRedis<
      PresidentialDataWithVotingResponse[]
    >('SWC_PRESIDENTIAL_RACES_DATA')
  } catch (error) {
    Sentry.captureException(error, {
      extra: { key: 'SWC_PRESIDENTIAL_RACES_DATA' },
    })
    throw error
  }

  return (
    <LocationRaceSpecific
      initialLiveResultData={presidentialRaceLiveResult}
      locale={locale}
      {...data}
    />
  )
}
