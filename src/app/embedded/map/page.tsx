import { Metadata } from 'next'

import { AdvocatesHeatmapPage } from '@/components/app/pageAdvocatesHeatmap/advocatesHeatmapPage'
import { getAdvocatesMapData } from '@/data/pageSpecific/getAdvocatesMapData'
import { getHomepageData } from '@/data/pageSpecific/getHomepageData'
import { PageProps } from '@/types'
import { generateMetadataDetails } from '@/utils/server/metadataUtils'
import { TOTAL_CRYPTO_ADVOCATE_COUNT_DISPLAY_NAME } from '@/utils/shared/constants'

export const revalidate = 60 // 1 minute
export const dynamic = 'error'

const title = 'Crypto advocates in America'
const description = `Stand With Crypto is first and foremost the result of ${TOTAL_CRYPTO_ADVOCATE_COUNT_DISPLAY_NAME}+ people fighting to keep crypto in America. We’ve also partnered with a number of companies to fight alongside us.`

export const metadata: Metadata = {
  ...generateMetadataDetails({
    title,
    description,
  }),
}

export default async function MapPage(props: PageProps) {
  const params = await props.params
  const homeDataProps = await getHomepageData({
    recentActivityLimit: 20,
    restrictToUS: true,
    countryCode: params.countryCode,
  })
  const advocatePerStateDataProps = await getAdvocatesMapData(params.countryCode)

  return (
    <AdvocatesHeatmapPage
      advocatesMapPageData={advocatePerStateDataProps}
      countryCode={params.countryCode}
      homepageData={homeDataProps}
      isEmbedded={true}
    />
  )
}
