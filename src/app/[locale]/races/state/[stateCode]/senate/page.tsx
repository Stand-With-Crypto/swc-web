import { Metadata } from 'next'

import { queryDTSILocationSenateSpecificInformation } from '@/data/dtsi/queries/queryDTSILocationSenateSpecificInformation'
import { PageProps } from '@/types'
import { generateMetadataDetails } from '@/utils/server/metadataUtils'
import { SECONDS_DURATION } from '@/utils/shared/seconds'
import { getUSStateNameFromStateCode } from '@/utils/shared/usStateUtils'
import { zodUsaState } from '@/validation/fields/zodUsaState'
import { LocationRaceSpecific } from '@/components/app/pageLocationKeyRaces/locationRaceSpecific'

export const dynamic = 'error'
export const revalidate = SECONDS_DURATION['10_MINUTES']

type LocationSenateRaceSpecificPageProps = PageProps<{
  stateCode: string
}>

export async function generateMetadata({
  params,
}: LocationSenateRaceSpecificPageProps): Promise<Metadata> {
  const stateCode = zodUsaState.parse(params.stateCode.toUpperCase())
  const stateName = getUSStateNameFromStateCode(stateCode)
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
  const { locale } = params
  const stateCode = zodUsaState.parse(params.stateCode.toUpperCase())

  const data = await queryDTSILocationSenateSpecificInformation({
    stateCode,
  })

  if (!data) {
    throw new Error(`Invalid params for LocationSenateSpecificPage: ${JSON.stringify(params)}`)
  }

  return <LocationRaceSpecific {...data} {...{ stateCode, locale }} />
}
