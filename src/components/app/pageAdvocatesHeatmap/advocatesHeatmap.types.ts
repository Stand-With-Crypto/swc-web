import { getAdvocatesMapData } from '@/data/pageSpecific/getAdvocatesMapData'
import { getHomepageData } from '@/data/pageSpecific/getHomepageData'
import { SupportedLocale } from '@/intl/locales'

export type PageAdvocatesHeatmapProps = {
  locale: SupportedLocale
  homepageData: Awaited<ReturnType<typeof getHomepageData>>
  advocatesMapPageData: Awaited<ReturnType<typeof getAdvocatesMapData>>
  title?: string
  description?: string
  isEmbedded?: boolean
}
