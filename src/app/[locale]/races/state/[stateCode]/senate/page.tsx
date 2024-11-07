import * as Sentry from '@sentry/nextjs'
import { Metadata } from 'next'

import { LocationRaceSpecific } from '@/components/app/pageLocationKeyRaces/locationRaceSpecific'
import { RacesVotingDataResponse } from '@/data/aggregations/decisionDesk/types'
import { queryDTSILocationSenateSpecificInformation } from '@/data/dtsi/queries/queryDTSILocationSenateSpecificInformation'
import { PageProps } from '@/types'
import { getDecisionDataFromRedis } from '@/utils/server/decisionDesk/cachedData'
import { SECONDS_DURATION } from '@/utils/shared/seconds'
import { getUSStateNameFromStateCode, USStateCode } from '@/utils/shared/usStateUtils'
import { zodUsaState } from '@/validation/fields/zodUsaState'

export const dynamic = 'error'
export const revalidate = SECONDS_DURATION['15_MINUTES']

type LocationSenateRaceSpecificPageProps = PageProps<{
  stateCode: string
}>

export async function generateMetadata({
  params,
}: LocationSenateRaceSpecificPageProps): Promise<Metadata> {
  const stateCode = zodUsaState.parse(params.stateCode.toUpperCase())
  const stateName = getUSStateNameFromStateCode(stateCode)
  const title = `${stateName} US Senate Race`
  const description = `See where politicians running for the US Senate in ${stateName} stand on crypto.`
  return {
    title,
    description,
  }
}

export default async function LocationSenateSpecificPage({
  params,
}: LocationSenateRaceSpecificPageProps) {
  const { locale } = params
  const stateCode = zodUsaState.parse(params.stateCode.toUpperCase())

  const [dataResult, ddhqRedisResult] = await Promise.allSettled([
    queryDTSILocationSenateSpecificInformation({ stateCode }),
    getDecisionDataFromRedis<RacesVotingDataResponse[]>(
      `SWC_${stateCode?.toUpperCase() as USStateCode}_STATE_RACES_DATA`,
    ),
  ])

  if (dataResult.status === 'rejected' || !dataResult.value) {
    throw new Error(`Invalid params for LocationSenateSpecificPage: ${JSON.stringify(params)}`)
  }
  const data = dataResult.value

  if (ddhqRedisResult.status === 'rejected') {
    Sentry.captureException(ddhqRedisResult.reason, {
      extra: { stateCode },
      tags: { domain: 'liveResult' },
    })
    throw new Error(`Failed to fetch senate race data: ${ddhqRedisResult.reason}`)
  }
  const liveResultdata = ddhqRedisResult.value
  if (!liveResultdata) {
    throw new Error(`No ddhq data LocationSenateSpecificPage: ${JSON.stringify(params)}`)
  }

  return (
    <LocationRaceSpecific
      initialLiveResultData={liveResultdata}
      {...data}
      {...{ stateCode, locale }}
    />
  )
}
