import { Metadata } from 'next'

import { AdvocatesHeatmapPage } from '@/components/app/pageAdvocatesHeatmap/advocatesHeatmapPage'
import { getAdvocatesMapData } from '@/data/pageSpecific/getAdvocatesMapData'
import { getHomepageData } from '@/data/pageSpecific/getHomepageData'
import { generateMetadataDetails } from '@/utils/server/metadataUtils'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'

export const revalidate = 60 // 1 minute
export const dynamic = 'error'

const title = 'Crypto advocates in the UK'
const description = `See how the community is taking a stand to safeguard the future of crypto in the UK.`

const countryCode = SupportedCountryCodes.GB

export const metadata: Metadata = {
  ...generateMetadataDetails({
    title,
    description,
  }),
}

export default async function MapPage() {
  const homeDataProps = await getHomepageData({
    recentActivityLimit: 20,
    countryCode,
  })
  const advocatePerStateDataProps = await getAdvocatesMapData({ countryCode })

  return (
    <AdvocatesHeatmapPage
      advocatesMapPageData={advocatePerStateDataProps}
      countryCode={countryCode}
      description={description}
      homepageData={homeDataProps}
      title={title}
    />
  )
}
