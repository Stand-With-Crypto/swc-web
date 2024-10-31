import * as Sentry from '@sentry/nextjs'
import { Metadata } from 'next'

import { LocationStateSpecific } from '@/components/app/pageLocationKeyRaces/locationStateSpecific'
import { RacesVotingDataResponse } from '@/data/aggregations/decisionDesk/types'
import { queryDTSILocationStateSpecificInformation } from '@/data/dtsi/queries/queryDTSILocationStateSpecificInformation'
import { getCongressLiveResultData } from '@/data/pageSpecific/getKeyRacesPageData'
import { PageProps } from '@/types'
import { getDecisionDataFromRedis } from '@/utils/server/decisionDesk/cachedData'
import { prismaClient } from '@/utils/server/prismaClient'
import { SECONDS_DURATION } from '@/utils/shared/seconds'
import { toBool } from '@/utils/shared/toBool'
import {
  getUSStateNameFromStateCode,
  US_STATE_CODE_TO_DISPLAY_NAME_MAP,
  USStateCode,
} from '@/utils/shared/usStateUtils'
import { zodUsaState } from '@/validation/fields/zodUsaState'

export const dynamic = 'error'
export const dynamicParams = toBool(process.env.MINIMIZE_PAGE_PRE_GENERATION)
export const revalidate = SECONDS_DURATION['30_SECONDS']

type LocationStateSpecificPageProps = PageProps<{
  stateCode: string
}>

export async function generateMetadata({
  params,
}: LocationStateSpecificPageProps): Promise<Metadata> {
  const stateCode = zodUsaState.parse(params.stateCode.toUpperCase())
  const stateName = getUSStateNameFromStateCode(stateCode)

  const title = `Key Races in ${stateName}`
  const description = `View the races critical to keeping crypto in ${stateName}.`
  return {
    title,
    description,
  }
}

export async function generateStaticParams() {
  return Object.keys(US_STATE_CODE_TO_DISPLAY_NAME_MAP)
    .slice(0, toBool(process.env.MINIMIZE_PAGE_PRE_GENERATION) ? 1 : 99999)
    .map(stateCode => ({
      stateCode: stateCode.toLowerCase(),
    }))
}

export default async function LocationStateSpecificPage({
  params,
}: LocationStateSpecificPageProps) {
  const { locale } = params
  const stateCode = zodUsaState.parse(params.stateCode.toUpperCase())
  const [
    dtsiResultsResult,
    countAdvocatesResult,
    ddhqRedisStateDataResult,
    ddhqRedisCongressDataResult,
  ] = await Promise.allSettled([
    queryDTSILocationStateSpecificInformation({ stateCode }),
    prismaClient.user.count({
      where: { address: { countryCode: 'US', administrativeAreaLevel1: stateCode } },
    }),
    getDecisionDataFromRedis<RacesVotingDataResponse[]>(
      `SWC_${stateCode?.toUpperCase() as USStateCode}_STATE_RACES_DATA`,
    ),
    getCongressLiveResultData(),
  ])

  if (dtsiResultsResult.status !== 'fulfilled') {
    throw new Error(`Invalid params for LocationStateSpecificPage: ${JSON.stringify(params)}`)
  }
  const dtsiResults = dtsiResultsResult.value

  if (countAdvocatesResult.status !== 'fulfilled') {
    throw new Error(`Failed to count advocates: ${countAdvocatesResult.reason}`)
  }
  const countAdvocates = countAdvocatesResult.value

  if (ddhqRedisStateDataResult.status !== 'fulfilled') {
    Sentry.captureMessage(
      `Failed to get "${stateCode}" state live race data for LocationStateSpecificPage`,
      {
        extra: { params, reason: ddhqRedisStateDataResult.reason },
        tags: { domain: 'liveResult' },
      },
    )
    throw new Error(
      `Failed to get "${stateCode}" state live race data for LocationStateSpecificPag: ${JSON.stringify(params)}`,
    )
  }
  const initialRaceData = ddhqRedisStateDataResult.value

  if (ddhqRedisCongressDataResult.status !== 'fulfilled') {
    Sentry.captureMessage(`Failed to get congress live race data for LocationStateSpecificPage`, {
      extra: { params, reason: ddhqRedisCongressDataResult.reason },
      tags: { domain: 'liveResult' },
    })

    throw new Error(
      `Failed to get congress live race data for LocationStateSpecificPage: ${ddhqRedisCongressDataResult.reason}`,
    )
  }
  const congressRaceLiveResult = ddhqRedisCongressDataResult.value

  return (
    <LocationStateSpecific
      countAdvocates={countAdvocates}
      initialCongressLiveResultData={congressRaceLiveResult}
      initialRaceData={initialRaceData || undefined}
      {...dtsiResults}
      {...{ stateCode, locale }}
    />
  )
}
