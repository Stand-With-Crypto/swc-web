import { notFound } from 'next/navigation'
import { validatePageNum } from 'src/components/app/pageCommunity/common/pageValidator'

import { EU_RECENT_ACTIVITY_PAGINATION } from '@/components/app/pageCommunity/eu/constants'
import { getPublicRecentActivity } from '@/data/recentActivity/getPublicRecentActivity'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'

const countryCode = SupportedCountryCodes.EU

const MAX_PAGES = 10

export async function getEuPageData({ page }: { page: string[] }) {
  const { itemsPerPage } = EU_RECENT_ACTIVITY_PAGINATION

  const pageNum = validatePageNum(page ?? [])
  if (!pageNum) {
    notFound()
  }
  const offset = (pageNum - 1) * itemsPerPage

  const publicRecentActivity = await getPublicRecentActivity({
    limit: itemsPerPage,
    offset,
    countryCode,
  })

  const totalPages = Math.min(Math.ceil(publicRecentActivity.count / itemsPerPage), MAX_PAGES)

  return {
    publicRecentActivity,
    totalPages,
    pageNum,
    offset,
  }
}
