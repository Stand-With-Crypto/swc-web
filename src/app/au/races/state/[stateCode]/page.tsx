import { Metadata } from 'next'

import { AULocationStateSpecific } from '@/components/app/pageLocationKeyRaces/au/locationStateSpecific'
import { queryDTSILocationStateSpecificInformation } from '@/data/dtsi/queries/queryDTSILocationStateSpecificInformation'
import { PageProps } from '@/types'
import { generateMetadataDetails } from '@/utils/server/metadataUtils'
import { prismaClient } from '@/utils/server/prismaClient'
import {
  AU_STATE_CODE_TO_DISPLAY_NAME_MAP,
  getAUStateNameFromStateCode,
} from '@/utils/shared/stateMappings/auStateUtils'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { toBool } from '@/utils/shared/toBool'
import { zodState } from '@/validation/fields/zodState'

export const revalidate = 600 // 10 minutes
export const dynamic = 'error'
export const dynamicParams = false

const countryCode = SupportedCountryCodes.AU

type LocationStateSpecificPageProps = PageProps<{
  stateCode: string
}>

export async function generateMetadata({
  params,
}: LocationStateSpecificPageProps): Promise<Metadata> {
  const { stateCode } = await params
  const validatedStateCode = zodState.parse(stateCode.toUpperCase(), countryCode)

  const stateName = getAUStateNameFromStateCode(validatedStateCode)

  const title = `Key Races in ${stateName}`
  const description = `View the races critical to keeping crypto in ${stateName}.`
  return generateMetadataDetails({
    title,
    description,
  })
}

export async function generateStaticParams() {
  return Object.keys(AU_STATE_CODE_TO_DISPLAY_NAME_MAP)
    .slice(0, toBool(process.env.MINIMIZE_PAGE_PRE_GENERATION) ? 1 : 99999)
    .map(stateCode => ({
      stateCode: stateCode.toLowerCase(),
    }))
}

export default async function LocationStateSpecificPage({
  params,
}: LocationStateSpecificPageProps) {
  const { stateCode } = await params
  const validatedStateCode = zodState.parse(stateCode.toUpperCase(), countryCode)
  const [dtsiResults, countAdvocates] = await Promise.all([
    queryDTSILocationStateSpecificInformation({ stateCode: validatedStateCode, countryCode }),
    prismaClient.user.count({
      where: { address: { countryCode, administrativeAreaLevel1: validatedStateCode } },
    }),
  ])

  if (!dtsiResults) {
    throw new Error(`Invalid params for LocationStateSpecificPage: ${JSON.stringify(params)}`)
  }

  return (
    <AULocationStateSpecific
      countAdvocates={countAdvocates}
      countryCode={countryCode}
      stateCode={validatedStateCode}
      {...dtsiResults}
    />
  )
}
