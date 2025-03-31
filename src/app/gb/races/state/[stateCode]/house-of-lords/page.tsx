import { Metadata } from 'next'

import { GBLocationRaceSpecific } from '@/components/app/pageLocationKeyRaces/gb/locationRaceSpecific'
import { queryDTSILocationSenateSpecificInformation } from '@/data/dtsi/queries/queryDTSILocationSenateSpecificInformation'
import { PageProps } from '@/types'
import { generateMetadataDetails } from '@/utils/server/metadataUtils'
import { getGBCountryNameFromCode } from '@/utils/shared/stateMappings/gbCountryUtils'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { zodState } from '@/validation/fields/zodState'

export const revalidate = 600 // 10 minutes
export const dynamic = 'error'
export const dynamicParams = false

const countryCode = SupportedCountryCodes.GB

type LocationHouseOfLordsRaceSpecificPageProps = PageProps<{
  stateCode: string
}>

export async function generateMetadata({
  params,
}: LocationHouseOfLordsRaceSpecificPageProps): Promise<Metadata> {
  const { stateCode } = await params
  const validatedStateCode = zodState.parse(stateCode.toUpperCase(), countryCode)
  const stateName = getGBCountryNameFromCode(validatedStateCode)
  const title = `${stateName} UK House of Lords Race`
  const description = `See where politicians running for the UK House of Lords in ${stateName} stand on crypto.`
  return generateMetadataDetails({
    title,
    description,
  })
}

export default async function LocationHouseOfLordsSpecificPage({
  params,
}: LocationHouseOfLordsRaceSpecificPageProps) {
  const { stateCode } = await params
  const validatedStateCode = zodState.parse(stateCode.toUpperCase(), countryCode)

  const data = await queryDTSILocationSenateSpecificInformation({
    stateCode: validatedStateCode,
    countryCode,
  })

  if (!data) {
    throw new Error(
      `Invalid params for LocationHouseOfLordsSpecificPage: ${JSON.stringify(params)}`,
    )
  }

  return <GBLocationRaceSpecific isHouseOfLords stateCode={validatedStateCode} {...data} />
}
