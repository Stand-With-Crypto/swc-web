import { flatten, times } from 'lodash-es'
import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { z } from 'zod'

import { LocationRaceSpecific } from '@/components/app/pageLocationRaceSpecific'
import { queryDTSILocationStateSpecificInformation } from '@/data/dtsi/queries/queryDTSILocationDistrictSpecificInformation'
import { PageProps } from '@/types'
import { formatDTSIDistrictId } from '@/utils/dtsi/dtsiPersonRoleUtils'
import { US_LOCATION_PAGES_LIVE } from '@/utils/shared/locationSpecificPages'
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

const zDistrictParse = z
  .string()
  .pipe(z.coerce.number().int().gte(1).lte(US_STATE_CODE_TO_DISTRICT_COUNT_MAP.CA))

type LocationDistrictSpecificPageProps = PageProps<{
  stateCode: string
  district: string
}>

export async function generateMetadata({
  params,
}: LocationDistrictSpecificPageProps): Promise<Metadata> {
  const district = zDistrictParse.parse(params.district)
  const stateCode = zodUsaState.parse(params.stateCode.toUpperCase())
  const stateName = getUSStateNameFromStateCode(stateCode)
  const title = `See where politicians in the ${formatDTSIDistrictId(district)} of ${stateName} stand on crypto`
  const description = `We asked politicians in the ${formatDTSIDistrictId(district)} of ${stateName} for their thoughts on crypto. Here's what they said.`
  return {
    title,
    description,
  }
}

export async function generateStaticParams() {
  return toBool(process.env.MINIMIZE_PAGE_PRE_GENERATION)
    ? US_LOCATION_PAGES_LIVE.slice(0, 1).map(state =>
        typeof state === 'string'
          ? {
              stateCode: state,
              district:
                US_STATE_CODE_TO_DISTRICT_COUNT_MAP[state as USStateCode] === 1 ? 'at-large' : `1`,
            }
          : { stateCode: state.stateCode, district: `${state.districts[0]}` },
      )
    : flatten(
        Object.keys(US_STATE_CODE_TO_DISPLAY_NAME_MAP).map(stateCode =>
          times(US_STATE_CODE_TO_DISTRICT_COUNT_MAP[stateCode as USStateCode]).map(
            districtIndex => ({
              stateCode: stateCode.toLowerCase(),
              district:
                US_STATE_CODE_TO_DISTRICT_COUNT_MAP[stateCode as USStateCode] === 1
                  ? 'at-large'
                  : `${districtIndex + 1}`,
            }),
          ),
        ),
      )
}

export default async function LocationDistrictSpecificPage({
  params,
}: LocationDistrictSpecificPageProps) {
  const { locale } = params
  const district = zodNormalizedDTSIDistrictId.parse(params.district)
  const stateCode = zodUsaState.parse(params.stateCode)

  const data = await queryDTSILocationStateSpecificInformation({
    stateCode,
    district,
  })

  if (!data) {
    notFound()
  }

  return <LocationRaceSpecific {...data} {...{ stateCode, district, locale }} />
}
