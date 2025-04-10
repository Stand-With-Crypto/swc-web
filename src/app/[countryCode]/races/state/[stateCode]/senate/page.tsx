import { Metadata } from 'next'

import { USLocationRaceSpecific } from '@/components/app/pageLocationKeyRaces/us/locationRaceSpecific'
import { queryDTSILocationSenateSpecificInformation } from '@/data/dtsi/queries/queryDTSILocationSenateSpecificInformation'
import { PageProps } from '@/types'
import { generateMetadataDetails } from '@/utils/server/metadataUtils'
import {
  getUSStateNameFromStateCode,
  US_STATE_CODE_TO_DISPLAY_NAME_MAP,
} from '@/utils/shared/stateMappings/usStateUtils'
import { DEFAULT_SUPPORTED_COUNTRY_CODE } from '@/utils/shared/supportedCountries'
import { toBool } from '@/utils/shared/toBool'
import { zodState } from '@/validation/fields/zodState'

export const revalidate = 600 // 10 minutes
export const dynamic = 'error'
export const dynamicParams = false

const countryCode = DEFAULT_SUPPORTED_COUNTRY_CODE

type LocationSenateRaceSpecificPageProps = PageProps<{
  stateCode: string
}>

export async function generateMetadata({
  params,
}: LocationSenateRaceSpecificPageProps): Promise<Metadata> {
  const { stateCode } = await params
  const validatedStateCode = zodState.parse(stateCode.toUpperCase(), countryCode)
  const stateName = getUSStateNameFromStateCode(validatedStateCode)
  const title = `${stateName} US Senate Race`
  const description = `See where politicians running for the US Senate in ${stateName} stand on crypto.`
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

export default async function LocationSenateSpecificPage({
  params,
}: LocationSenateRaceSpecificPageProps) {
  const { stateCode } = await params
  const validatedStateCode = zodState.parse(stateCode.toUpperCase(), countryCode)

  const data = await queryDTSILocationSenateSpecificInformation({
    stateCode: validatedStateCode,
    countryCode,
  })

  if (!data) {
    throw new Error(`Invalid params for LocationSenateSpecificPage: ${JSON.stringify(params)}`)
  }

  return <USLocationRaceSpecific {...data} stateCode={validatedStateCode} />
}
