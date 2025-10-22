import { AdvocatesHeatmapPage } from '@/components/app/pageAdvocatesHeatmap/advocatesHeatmapPage'
import { getCountUsers } from '@/data/aggregations/getCountUsers'
import { getAdvocatesMapData } from '@/data/pageSpecific/getAdvocatesMapData'
import { getPublicRecentActivity } from '@/data/recentActivity/getPublicRecentActivity'
import { PageProps } from '@/types'

export const revalidate = 60 // 1 minute
export const dynamic = 'error'

export default async function MapPage(props: PageProps) {
  const params = await props.params

  const countryCode = params.countryCode

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
      isEmbedded={true}
    />
  )
}
