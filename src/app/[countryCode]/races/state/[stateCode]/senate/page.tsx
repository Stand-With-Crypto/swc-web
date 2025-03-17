import { Metadata } from 'next'

import { LocationRaceSpecific } from '@/components/app/pageLocationKeyRaces/locationRaceSpecific'
import { queryDTSILocationSenateSpecificInformation } from '@/data/dtsi/queries/queryDTSILocationSenateSpecificInformation'
import { PageProps } from '@/types'
import { generateMetadataDetails } from '@/utils/server/metadataUtils'
import { getUSStateNameFromStateCode } from '@/utils/shared/usStateUtils'
import { zodUsaState } from '@/validation/fields/zodUsaState'

export const revalidate = 600 // 10 minutes
export const dynamic = 'error'
export const dynamicParams = false

type LocationSenateRaceSpecificPageProps = PageProps<{
  stateCode: string
}>

export async function generateMetadata({
  params,
}: LocationSenateRaceSpecificPageProps): Promise<Metadata> {
  const { stateCode } = await params
  const validatedStateCode = zodUsaState.parse(stateCode.toUpperCase())
  const stateName = getUSStateNameFromStateCode(validatedStateCode)
  const title = `${stateName} US Senate Race`
  const description = `See where politicians running for the US Senate in ${stateName} stand on crypto.`
  return generateMetadataDetails({
    title,
    description,
  })
}

export default async function LocationSenateSpecificPage({
  params,
}: LocationSenateRaceSpecificPageProps) {
  const { stateCode, countryCode } = await params
  const validatedStateCode = zodUsaState.parse(stateCode.toUpperCase())

  const data = await queryDTSILocationSenateSpecificInformation({
    stateCode: validatedStateCode,
  })

  if (!data) {
    throw new Error(`Invalid params for LocationSenateSpecificPage: ${JSON.stringify(params)}`)
  }

  return <LocationRaceSpecific {...data} {...{ stateCode: validatedStateCode, countryCode }} />
}
