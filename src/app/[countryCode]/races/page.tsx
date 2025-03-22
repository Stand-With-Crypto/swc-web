import { Metadata } from 'next'

import { LocationUnitedStates } from '@/components/app/pageLocationKeyRaces/us/locationUnitedStates'
import { queryDTSILocationUnitedStatesInformation } from '@/data/dtsi/queries/queryDTSILocationUnitedStatesInformation'
import { PageProps } from '@/types'
import { generateMetadataDetails } from '@/utils/server/metadataUtils'
import { prismaClient } from '@/utils/server/prismaClient'

export const revalidate = 600 // 10 minutes
export const dynamic = 'error'
export const dynamicParams = false

type LocationUnitedStatesPageProps = PageProps

export async function generateMetadata(): Promise<Metadata> {
  const title = `Key Races in the United States`
  const description = `View the races critical to keeping crypto in America.`
  return generateMetadataDetails({
    title,
    description,
  })
}

export default async function LocationUnitedStatesPage({ params }: LocationUnitedStatesPageProps) {
  const { countryCode } = await params
  const [dtsiResults, countAdvocates] = await Promise.all([
    queryDTSILocationUnitedStatesInformation(),
    prismaClient.user.count(),
  ])

  return (
    <LocationUnitedStates countAdvocates={countAdvocates} {...dtsiResults} {...{ countryCode }} />
  )
}
