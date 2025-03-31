import { Metadata } from 'next'

import { AULocationRaceSpecific } from '@/components/app/pageLocationKeyRaces/au/locationRaceSpecific'
import { queryDTSILocationSenateSpecificInformation } from '@/data/dtsi/queries/queryDTSILocationSenateSpecificInformation'
import { PageProps } from '@/types'
import { generateMetadataDetails } from '@/utils/server/metadataUtils'
import { getAUStateNameFromStateCode } from '@/utils/shared/stateMappings/auStateUtils'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { zodState } from '@/validation/fields/zodState'

export const revalidate = 600 // 10 minutes
export const dynamic = 'error'
export const dynamicParams = false

const countryCode = SupportedCountryCodes.AU

type LocationSenateRaceSpecificPageProps = PageProps<{
  stateCode: string
}>

export async function generateMetadata({
  params,
}: LocationSenateRaceSpecificPageProps): Promise<Metadata> {
  const { stateCode } = await params
  const validatedStateCode = zodState.parse(stateCode.toUpperCase(), countryCode)
  const stateName = getAUStateNameFromStateCode(validatedStateCode)
  const title = `${stateName} Australian Senate Race`
  const description = `See where politicians running for the Australian Senate in ${stateName} stand on crypto.`
  return generateMetadataDetails({
    title,
    description,
  })
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

  return <AULocationRaceSpecific isSenate stateCode={validatedStateCode} {...data} />
}
