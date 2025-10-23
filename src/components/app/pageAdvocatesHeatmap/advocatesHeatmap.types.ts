import { getCountUsers } from '@/data/aggregations/getCountUsers'
import { getAdvocatesMapData } from '@/data/pageSpecific/getAdvocatesMapData'
import { getPublicRecentActivity } from '@/data/recentActivity/getPublicRecentActivity'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'

export interface PageAdvocatesHeatmapProps {
  countryCode: SupportedCountryCodes
  countUsers: Awaited<ReturnType<typeof getCountUsers>>
  actions: Awaited<ReturnType<typeof getPublicRecentActivity>>
  advocatesMapPageData: Awaited<ReturnType<typeof getAdvocatesMapData>>
  title?: string
  description?: string
  isEmbedded?: boolean
}
