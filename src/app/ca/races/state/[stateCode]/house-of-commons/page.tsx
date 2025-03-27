import { Metadata } from 'next'

import { CALocationRaceSpecific } from '@/components/app/pageLocationKeyRaces/ca/locationRaceSpecific'
import { queryDTSILocationHouseSpecificInformation } from '@/data/dtsi/queries/queryDTSILocationHouseSpecificInformation'
import { PageProps } from '@/types'
import { generateMetadataDetails } from '@/utils/server/metadataUtils'
import { getCAProvinceOrTerritoryNameFromCode } from '@/utils/shared/stateMappings/caProvinceUtils'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { zodState } from '@/validation/fields/zodState'

export const revalidate = 600 // 10 minutes
export const dynamic = 'error'
export const dynamicParams = false

const countryCode = SupportedCountryCodes.CA

type LocationHouseOfCommonsRaceSpecificPageProps = PageProps<{
  stateCode: string
}>

export async function generateMetadata({
  params,
}: LocationHouseOfCommonsRaceSpecificPageProps): Promise<Metadata> {
  const { stateCode } = await params
  const validatedStateCode = zodState.parse(stateCode.toUpperCase(), countryCode)
  const stateName = getCAProvinceOrTerritoryNameFromCode(validatedStateCode)
  const title = `${stateName} Canadian House of Commons Race`
  const description = `See where politicians running for the Canadian House of Commons in ${stateName} stand on crypto.`
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
    <CALocationRaceSpecific {...data} countryCode={countryCode} stateCode={validatedStateCode} />
  )
}
