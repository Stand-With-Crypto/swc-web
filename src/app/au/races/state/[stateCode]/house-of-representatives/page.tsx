import { Metadata } from 'next'

import { AULocationRaceSpecific } from '@/components/app/pageLocationKeyRaces/au/locationRaceSpecific'
import { queryDTSILocationHouseSpecificInformation } from '@/data/dtsi/queries/queryDTSILocationHouseSpecificInformation'
import { PageProps } from '@/types'
import { generateMetadataDetails } from '@/utils/server/metadataUtils'
import { getAUStateNameFromStateCode } from '@/utils/shared/stateMappings/auStateUtils'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { zodState } from '@/validation/fields/zodState'

export const revalidate = 600 // 10 minutes
export const dynamic = 'error'
export const dynamicParams = false

const countryCode = SupportedCountryCodes.AU

type LocationHouseOfRepsRaceSpecificPageProps = PageProps<{
  stateCode: string
}>

export async function generateMetadata({
  params,
}: LocationHouseOfRepsRaceSpecificPageProps): Promise<Metadata> {
  const { stateCode } = await params
  const validatedStateCode = zodState.parse(stateCode.toUpperCase(), countryCode)
  const stateName = getAUStateNameFromStateCode(validatedStateCode)
  const title = `${stateName} Australian House of Representatives Race`
  const description = `See where politicians running for the Australian House of Representatives in ${stateName} stand on crypto.`
  return generateMetadataDetails({
    title,
    description,
  })
}

export default async function LocationHouseOfRepsSpecificPage({
  params,
}: LocationHouseOfRepsRaceSpecificPageProps) {
  const { stateCode } = await params
  const validatedStateCode = zodState.parse(stateCode.toUpperCase(), countryCode)

  const data = await queryDTSILocationHouseSpecificInformation({
    stateCode: validatedStateCode,
    countryCode,
  })

  if (!data) {
    throw new Error(`Invalid params for LocationHouseOfRepsSpecificPage: ${JSON.stringify(params)}`)
  }

  return (
    <AULocationRaceSpecific {...data} countryCode={countryCode} stateCode={validatedStateCode} />
  )
}
