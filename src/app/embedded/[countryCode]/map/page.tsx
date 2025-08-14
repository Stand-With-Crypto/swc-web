import { AdvocatesHeatmapPage } from '@/components/app/pageAdvocatesHeatmap/advocatesHeatmapPage'
import { getAdvocatesMapData } from '@/data/pageSpecific/getAdvocatesMapData'
import { getHomepageData } from '@/data/pageSpecific/getHomepageData'
import { PageProps } from '@/types'

export const revalidate = 60 // 1 minute
export const dynamic = 'error'

export default async function MapPage(props: PageProps) {
  const params = await props.params

  const countryCode = params.countryCode

  const homeDataProps = await getHomepageData({
    recentActivityLimit: 20,
    countryCode,
  })
  const advocatePerStateDataProps = await getAdvocatesMapData({ countryCode })

  return (
    <AdvocatesHeatmapPage
      advocatesMapPageData={advocatePerStateDataProps}
      countryCode={countryCode}
      homepageData={homeDataProps}
      isEmbedded={true}
    />
  )
}
