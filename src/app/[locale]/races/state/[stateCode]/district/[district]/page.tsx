import { flatten, times } from 'lodash-es'
import { Metadata } from 'next'

import { LocationRaceSpecific } from '@/components/app/pageLocationRaceSpecific'
import { queryDTSILocationDistrictSpecificInformation } from '@/data/dtsi/queries/queryDTSILocationDistrictSpecificInformation'
import { PageProps } from '@/types'
import { formatDTSIDistrictId } from '@/utils/dtsi/dtsiPersonRoleUtils'
import { generateMetadataDetails } from '@/utils/server/metadataUtils'
import { SECONDS_DURATION } from '@/utils/shared/seconds'
import { toBool } from '@/utils/shared/toBool'
import { US_STATE_CODE_TO_DISTRICT_COUNT_MAP } from '@/utils/shared/usStateDistrictUtils'
import {
  getUSStateNameFromStateCode,
  US_STATE_CODE_TO_DISPLAY_NAME_MAP,
  USStateCode,
} from '@/utils/shared/usStateUtils'
import { zodNormalizedDTSIDistrictId } from '@/validation/fields/zodNormalizedDTSIDistrictId'
import { zodUsaState } from '@/validation/fields/zodUsaState'

export const dynamic = 'error'
export const dynamicParams = toBool(process.env.MINIMIZE_PAGE_PRE_GENERATION)
export const revalidate = SECONDS_DURATION.MINUTE * 10

type LocationDistrictSpecificPageProps = PageProps<{
  stateCode: string
  district: string
}>

export async function generateMetadata({
  params,
}: LocationDistrictSpecificPageProps): Promise<Metadata> {
  const district = zodNormalizedDTSIDistrictId.parse(params.district)
  const stateCode = zodUsaState.parse(params.stateCode.toUpperCase())
  const stateName = getUSStateNameFromStateCode(stateCode)
  const title = `${stateCode} ${formatDTSIDistrictId(district)} District Congressional Race`
  const description = `See where politicians running for in the ${formatDTSIDistrictId(district)} district of ${stateName} stand on crypto.`
  return generateMetadataDetails({
    title,
    description,
  })
}

export async function generateStaticParams() {
  return flatten(
    Object.keys(US_STATE_CODE_TO_DISPLAY_NAME_MAP).map(stateCode =>
      times(US_STATE_CODE_TO_DISTRICT_COUNT_MAP[stateCode as USStateCode]).map(districtIndex => ({
        stateCode: stateCode.toLowerCase(),
        district:
          US_STATE_CODE_TO_DISTRICT_COUNT_MAP[stateCode as USStateCode] === 1
            ? 'at-large'
            : `${districtIndex + 1}`,
      })),
    ),
  ).slice(0, toBool(process.env.MINIMIZE_PAGE_PRE_GENERATION) ? 1 : 9999999)
}

export default async function LocationDistrictSpecificPage({
  params,
}: LocationDistrictSpecificPageProps) {
  const { locale } = params
  const district = zodNormalizedDTSIDistrictId.parse(params.district)
  const stateCode = zodUsaState.parse(params.stateCode.toUpperCase())

  const data = await queryDTSILocationDistrictSpecificInformation({
    stateCode,
    district,
  })

  if (!data) {
    throw new Error(`Invalid params for LocationDistrictSpecificPage: ${JSON.stringify(params)}`)
  }

  return <LocationRaceSpecific {...data} {...{ stateCode, district, locale }} />
}
