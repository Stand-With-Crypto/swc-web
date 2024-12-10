import * as Sentry from '@sentry/nextjs'
import { flatten, times } from 'lodash-es'
import { Metadata } from 'next'

import { LocationRaceSpecific } from '@/components/app/pageLocationKeyRaces/locationRaceSpecific'
import { RacesVotingDataResponse } from '@/data/aggregations/decisionDesk/types'
import { queryDTSILocationDistrictSpecificInformation } from '@/data/dtsi/queries/queryDTSILocationDistrictSpecificInformation'
import { PageProps } from '@/types'
import { formatDTSIDistrictId } from '@/utils/dtsi/dtsiPersonRoleUtils'
import { getDecisionDataFromRedis } from '@/utils/server/decisionDesk/cachedData'
import { toBool } from '@/utils/shared/toBool'
import { US_STATE_CODE_TO_DISTRICT_COUNT_MAP } from '@/utils/shared/usStateDistrictUtils'
import {
  getUSStateNameFromStateCode,
  US_STATE_CODE_TO_DISPLAY_NAME_MAP,
  USStateCode,
} from '@/utils/shared/usStateUtils'
import { zodNormalizedDTSIDistrictId } from '@/validation/fields/zodNormalizedDTSIDistrictId'
import { zodUsaState } from '@/validation/fields/zodUsaState'

export const revalidate = 900 // 15 minutes
export const dynamic = 'error'
export const dynamicParams = false

type LocationDistrictSpecificPageProps = PageProps<{
  stateCode: string
  district: string
}>

export async function generateMetadata(
  props: LocationDistrictSpecificPageProps,
): Promise<Metadata> {
  const params = await props.params
  const district = zodNormalizedDTSIDistrictId.parse(params.district)
  const stateCode = zodUsaState.parse(params.stateCode.toUpperCase())
  const stateName = getUSStateNameFromStateCode(stateCode)
  const title = `${stateCode} ${formatDTSIDistrictId(district)} District Congressional Race`
  const description = `See where politicians running for in the ${formatDTSIDistrictId(district)} district of ${stateName} stand on crypto.`
  return {
    title,
    description,
  }
}

export async function generateStaticParams() {
  return flatten(
    Object.keys(US_STATE_CODE_TO_DISPLAY_NAME_MAP).map(stateCode =>
      times(US_STATE_CODE_TO_DISTRICT_COUNT_MAP[stateCode as USStateCode] || 1).map(
        districtIndex => ({
          stateCode: stateCode.toLowerCase(),
          district: [0, 1].includes(US_STATE_CODE_TO_DISTRICT_COUNT_MAP[stateCode as USStateCode])
            ? 'at-large'
            : `${districtIndex + 1}`,
        }),
      ),
    ),
  ).slice(0, toBool(process.env.MINIMIZE_PAGE_PRE_GENERATION) ? 1 : 9999999)
}

export default async function LocationDistrictSpecificPage(
  props: LocationDistrictSpecificPageProps,
) {
  const params = await props.params
  const { locale } = params
  const district = zodNormalizedDTSIDistrictId.parse(params.district)
  const stateCode = zodUsaState.parse(params.stateCode.toUpperCase())

  const [dtsiResultsResult, ddhqRedisResult] = await Promise.allSettled([
    queryDTSILocationDistrictSpecificInformation({ stateCode, district }),
    getDecisionDataFromRedis<RacesVotingDataResponse[]>(
      `SWC_${stateCode?.toUpperCase() as USStateCode}_STATE_RACES_DATA`,
    ),
  ])

  if (dtsiResultsResult.status === 'rejected') {
    throw new Error(`Failed to fetch DTSI results: ${dtsiResultsResult.reason}`)
  }
  const dtsiResults = dtsiResultsResult.value
  if (!dtsiResults) {
    throw new Error(`Invalid params for LocationDistrictSpecificPage: ${JSON.stringify(params)}`)
  }

  if (ddhqRedisResult.status === 'rejected') {
    Sentry.captureException(ddhqRedisResult.reason, {
      extra: { district, stateCode },
      tags: { domain: 'liveResult' },
    })
    throw new Error(`Failed to fetch district race data: ${ddhqRedisResult.reason}`)
  }

  const initialLiveResultData =
    ddhqRedisResult.value?.filter?.(data => data.district?.toLowerCase() === district.toString()) ??
    null

  if (!initialLiveResultData) {
    Sentry.captureMessage('No ddhq data for LocationDistrictSpecificPage', {
      extra: { stateCode, district },
      tags: { domain: 'liveResult' },
    })
    throw new Error(`No ddhq data for LocationDistrictSpecificPage: ${JSON.stringify(params)}`)
  }

  return (
    <LocationRaceSpecific
      initialLiveResultData={initialLiveResultData}
      {...dtsiResults}
      {...{ stateCode, district, locale }}
    />
  )
}
