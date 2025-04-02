import { flatten, times } from 'lodash-es'
import { Metadata } from 'next'

import { USLocationRaceSpecific } from '@/components/app/pageLocationKeyRaces/us/locationRaceSpecific'
import { queryDTSILocationDistrictSpecificInformation } from '@/data/dtsi/queries/queryDTSILocationDistrictSpecificInformation'
import { PageProps } from '@/types'
import { formatDTSIDistrictId } from '@/utils/dtsi/dtsiPersonRoleUtils'
import { generateMetadataDetails } from '@/utils/server/metadataUtils'
import { US_STATE_CODE_TO_DISTRICT_COUNT_MAP } from '@/utils/shared/stateMappings/usStateDistrictUtils'
import {
  getUSStateNameFromStateCode,
  US_STATE_CODE_TO_DISPLAY_NAME_MAP,
  USStateCode,
} from '@/utils/shared/stateMappings/usStateUtils'
import { toBool } from '@/utils/shared/toBool'
import { zodNormalizedDTSIDistrictId } from '@/validation/fields/zodNormalizedDTSIDistrictId'
import { zodUsaState } from '@/validation/fields/zodUsaState'

export const revalidate = 600 // 10 minutes
export const dynamic = 'error'
export const dynamicParams = false

type LocationDistrictSpecificPageProps = PageProps<{
  stateCode: string
  district: string
}>

export async function generateMetadata({
  params,
}: LocationDistrictSpecificPageProps): Promise<Metadata> {
  const { district, stateCode } = await params
  const validatedDistrict = zodNormalizedDTSIDistrictId.parse(district)
  const validatedStateCode = zodUsaState.parse(stateCode.toUpperCase())
  const stateName = getUSStateNameFromStateCode(validatedStateCode)
  const title = `${stateCode} ${formatDTSIDistrictId(validatedDistrict)} District Congressional Race`
  const description = `See where politicians running for in the ${formatDTSIDistrictId(
    validatedDistrict,
  )} district of ${stateName} stand on crypto.`
  return generateMetadataDetails({
    title,
    description,
  })
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

export default async function LocationDistrictSpecificPage({
  params,
}: LocationDistrictSpecificPageProps) {
  const { district, stateCode } = await params
  const validatedDistrict = zodNormalizedDTSIDistrictId.parse(district)
  const validatedStateCode = zodUsaState.parse(stateCode.toUpperCase())

  const data = await queryDTSILocationDistrictSpecificInformation({
    stateCode: validatedStateCode,
    district: validatedDistrict,
  })

  if (!data) {
    throw new Error(`Invalid params for LocationDistrictSpecificPage: ${JSON.stringify(params)}`)
  }

  return (
    <USLocationRaceSpecific {...data} district={validatedDistrict} stateCode={validatedStateCode} />
  )
}
