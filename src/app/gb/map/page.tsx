import { Metadata } from 'next'

import { AdvocatesHeatmapPage } from '@/components/app/pageAdvocatesHeatmap/advocatesHeatmapPage'
import { getCountUsers } from '@/data/aggregations/getCountUsers'
import { getAdvocatesMapData } from '@/data/pageSpecific/getAdvocatesMapData'
import { getPublicRecentActivity } from '@/data/recentActivity/getPublicRecentActivity'
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
  const [actions, countUsers] = await Promise.all([
    getPublicRecentActivity({
      limit: 20,
      countryCode,
    }),
    getCountUsers(),
  ])
  const advocatePerStateDataProps = await getAdvocatesMapData({ countryCode })

  return (
    <AdvocatesHeatmapPage
      actions={actions}
      advocatesMapPageData={advocatePerStateDataProps}
      countUsers={countUsers}
      countryCode={countryCode}
      description={description}
      title={title}
    />
  )
}
