import { notFound } from 'next/navigation'
import { validatePageNum } from 'src/components/app/pageCommunity/common/pageValidator'
import { GB_RECENT_ACTIVITY_PAGINATION } from 'src/components/app/pageCommunity/gb/constants'

import { getPublicRecentActivity } from '@/data/recentActivity/getPublicRecentActivity'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'

const MAX_PAGES = 10

const COUNTRY_CODE = SupportedCountryCodes.GB

export async function GBGetPageData({ page, state }: { page: string[]; state?: string }) {
  const { itemsPerPage } = GB_RECENT_ACTIVITY_PAGINATION

  const pageNum = validatePageNum(page ?? [])
  if (!pageNum) {
    notFound()
  }
  const offset = (pageNum - 1) * itemsPerPage

  const publicRecentActivity = await getPublicRecentActivity({
    limit: itemsPerPage,
    offset,
    countryCode: COUNTRY_CODE,
    ...(state && { stateCode: state.toUpperCase() }),
  })

  return {
    publicRecentActivity,
    totalPages: state
      ? Math.min(Math.ceil(publicRecentActivity.count / itemsPerPage), MAX_PAGES)
      : GB_RECENT_ACTIVITY_PAGINATION.totalPages,
    pageNum,
    offset,
  }
}
