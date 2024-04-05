import { Metadata } from 'next'

import { LocationRaceSpecific } from '@/components/app/pageLocationRaceSpecific'
import { queryDTSILocationSenateSpecificInformation } from '@/data/dtsi/queries/queryDTSILocationSenateSpecificInformation'
import { PageProps } from '@/types'
import { generateMetadataDetails } from '@/utils/server/metadataUtils'
import { getUSStateNameFromStateCode } from '@/utils/shared/usStateUtils'
import { zodUsaState } from '@/validation/fields/zodUsaState'

export const dynamic = 'error'

type LocationSenateRaceSpecificPageProps = PageProps<{
  stateCode: string
}>

export async function generateMetadata({
  params,
}: LocationSenateRaceSpecificPageProps): Promise<Metadata> {
  const stateCode = zodUsaState.parse(params.stateCode.toUpperCase())
  const stateName = getUSStateNameFromStateCode(stateCode)
  const title = `See where politicians in ${stateName} stand on crypto`
  const description = `We asked politicians in ${stateName} for their thoughts on crypto. Here's what they said.`
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
