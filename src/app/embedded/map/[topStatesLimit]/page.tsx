import { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { AdvocatesHeatmapPage } from '@/components/app/pageAdvocatesHeatmap/advocatesHeatmapPage'
import { getAdvocatesMapData } from '@/data/pageSpecific/getAdvocatesMapData'
import { getHomepageData } from '@/data/pageSpecific/getHomepageData'
import { PageProps } from '@/types'
import { generateMetadataDetails } from '@/utils/server/metadataUtils'
import { TOTAL_CRYPTO_ADVOCATE_COUNT_DISPLAY_NAME } from '@/utils/shared/constants'
import { SECONDS_DURATION } from '@/utils/shared/seconds'

export const revalidate = SECONDS_DURATION.MINUTE
export const dynamic = 'error'

const title = 'Crypto advocates in America'
const description = `Stand With Crypto is first and foremost the result of ${TOTAL_CRYPTO_ADVOCATE_COUNT_DISPLAY_NAME}+ people fighting to keep crypto in America. We’ve also partnered with a number of companies to fight alongside us.`

export const metadata: Metadata = {
  ...generateMetadataDetails({
    title,
    description,
  }),
}

export default async function MapPage({ params }: PageProps<{ topStatesLimit: number }>) {
  const homeDataProps = await getHomepageData()
  const advocatePerStateDataProps = await getAdvocatesMapData(params.topStatesLimit)

  if (isNaN(+params.topStatesLimit)) {
    return notFound()
  }

  return (
    <AdvocatesHeatmapPage
      advocatesMapPageData={advocatePerStateDataProps}
      homepageData={homeDataProps}
      locale={params.locale}
      topStatesLimit={params.topStatesLimit}
    />
  )
}
