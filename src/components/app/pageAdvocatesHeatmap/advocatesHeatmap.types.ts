import { getAdvocatesMapData } from '@/data/pageSpecific/getAdvocatesMapData'
import { getHomepageData } from '@/data/pageSpecific/getHomepageData'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'

export type PageAdvocatesHeatmapProps = {
  countryCode: SupportedCountryCodes
  homepageData: Awaited<ReturnType<typeof getHomepageData>>
  advocatesMapPageData: Awaited<ReturnType<typeof getAdvocatesMapData>>
  title?: string
  description?: string
  isEmbedded?: boolean
}
