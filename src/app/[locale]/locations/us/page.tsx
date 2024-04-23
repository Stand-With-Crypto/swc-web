import { Metadata } from 'next'

import { LocationUnitedStates } from '@/components/app/pageLocationUnitedStates'
import { queryDTSILocationUnitedStatesInformation } from '@/data/dtsi/queries/queryDTSILocationUnitedStatesInformation'
import { PageProps } from '@/types'
import { generateMetadataDetails } from '@/utils/server/metadataUtils'
import { prismaClient } from '@/utils/server/prismaClient'
import { SECONDS_DURATION } from '@/utils/shared/seconds'
import { toBool } from '@/utils/shared/toBool'

export const dynamic = 'error'
export const dynamicParams = toBool(process.env.MINIMIZE_PAGE_PRE_GENERATION)
export const revalidate = SECONDS_DURATION.HOUR

type LocationUnitedStatesPageProps = PageProps

export async function generateMetadata(): Promise<Metadata> {
  const title = `See where US politicians stand on crypto`
  const description = `We asked US politicians for their thoughts on crypto. Here's what they said.`
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
