import { Metadata } from 'next'

import { GBLocationRaceSpecific } from '@/components/app/pageLocationKeyRaces/gb/locationRaceSpecific'
import { queryDTSILocationHouseSpecificInformation } from '@/data/dtsi/queries/queryDTSILocationHouseSpecificInformation'
import { PageProps } from '@/types'
import { generateMetadataDetails } from '@/utils/server/metadataUtils'
import { getUSStateNameFromStateCode } from '@/utils/shared/stateMappings/usStateUtils'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { zodState } from '@/validation/fields/zodState'

export const revalidate = 600 // 10 minutes
export const dynamic = 'error'
export const dynamicParams = false

const countryCode = SupportedCountryCodes.GB

type LocationHouseOfCommonsRaceSpecificPageProps = PageProps<{
  stateCode: string
}>

export async function generateMetadata({
  params,
}: LocationHouseOfCommonsRaceSpecificPageProps): Promise<Metadata> {
  const { stateCode } = await params
  const validatedStateCode = zodState.parse(stateCode.toUpperCase(), countryCode)
  const stateName = getUSStateNameFromStateCode(validatedStateCode)
  const title = `${stateName} UK House of Commons Race`
  const description = `See where politicians running for the UK House of Commons in ${stateName} stand on crypto.`
  return generateMetadataDetails({
    title,
    description,
  })
}

export default async function LocationHouseOfCommonsSpecificPage({
  params,
}: LocationHouseOfCommonsRaceSpecificPageProps) {
  const { stateCode } = await params
  const validatedStateCode = zodState.parse(stateCode.toUpperCase(), countryCode)

  const data = await queryDTSILocationHouseSpecificInformation({
    stateCode: validatedStateCode,
    countryCode,
  })

  if (!data) {
    throw new Error(
      `Invalid params for LocationHouseOfCommonsSpecificPage: ${JSON.stringify(params)}`,
    )
  }

  return (
    <GBLocationRaceSpecific {...data} countryCode={countryCode} stateCode={validatedStateCode} />
  )
}
