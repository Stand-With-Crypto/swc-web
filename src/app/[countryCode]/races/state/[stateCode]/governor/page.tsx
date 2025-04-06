import { Metadata } from 'next'

import { USLocationRaceGovernorSpecific } from '@/components/app/pageLocationKeyRaces/us/locationRaceGovernorSpecific'
import { queryDTSILocationGovernorSpecificInformation } from '@/data/dtsi/queries/queryDTSILocationGovernorSpecificInformation'
import { PageProps } from '@/types'
import { generateMetadataDetails } from '@/utils/server/metadataUtils'
import {
  getUSStateNameFromStateCode,
  US_STATE_CODE_TO_DISPLAY_NAME_MAP,
} from '@/utils/shared/stateMappings/usStateUtils'
import { toBool } from '@/utils/shared/toBool'
import { zodUsaState } from '@/validation/fields/zodUsaState'

export const revalidate = 600 // 10 minutes
export const dynamic = 'error'
export const dynamicParams = true

type LocationStateGovernorSpecificPageProps = PageProps<{
  stateCode: string
}>

export async function generateMetadata({
  params,
}: LocationStateGovernorSpecificPageProps): Promise<Metadata> {
  const { stateCode } = await params
  const validatedStateCode = zodUsaState.parse(stateCode.toUpperCase())

  const stateName = getUSStateNameFromStateCode(validatedStateCode)

  const title = `Governor Races in ${stateName}`
  const description = `View the races critical to keeping crypto in ${stateName}.`
  return generateMetadataDetails({
    title,
    description,
  })
}

export async function generateStaticParams() {
  return Object.keys(US_STATE_CODE_TO_DISPLAY_NAME_MAP)
    .slice(0, toBool(process.env.MINIMIZE_PAGE_PRE_GENERATION) ? 1 : 99999)
    .map(stateCode => ({
      stateCode: stateCode.toLowerCase(),
    }))
}

export default async function LocationStateGovernorSpecificPage({
  params,
}: LocationStateGovernorSpecificPageProps) {
  const { stateCode } = await params
  const validatedStateCode = zodUsaState.parse(stateCode.toUpperCase())

  const data = await queryDTSILocationGovernorSpecificInformation({
    stateCode: validatedStateCode,
  })

  if (!data) {
    throw new Error(`Invalid params for LocationGovernorSpecificPage: ${JSON.stringify(params)}`)
  }

  return <USLocationRaceGovernorSpecific {...data} stateCode={validatedStateCode} />
}
