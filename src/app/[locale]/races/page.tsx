import { Metadata } from 'next'

import { LocationUnitedStates } from '@/components/app/pageLocationKeyRaces/locationUnitedStates'
import { queryDTSILocationUnitedStatesInformation } from '@/data/dtsi/queries/queryDTSILocationUnitedStatesInformation'
import { PageProps } from '@/types'
import { generateMetadataDetails } from '@/utils/server/metadataUtils'
import { prismaClient } from '@/utils/server/prismaClient'
import { SECONDS_DURATION } from '@/utils/shared/seconds'
import { toBool } from '@/utils/shared/toBool'

export const dynamic = 'error'
export const dynamicParams = toBool(process.env.MINIMIZE_PAGE_PRE_GENERATION)
export const revalidate = SECONDS_DURATION['10_MINUTES']

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
  const { locale } = params
  const [dtsiResults, countAdvocates] = await Promise.all([
    queryDTSILocationUnitedStatesInformation(),
    prismaClient.user.count(),
  ])

  return <LocationUnitedStates countAdvocates={countAdvocates} {...dtsiResults} {...{ locale }} />
}
