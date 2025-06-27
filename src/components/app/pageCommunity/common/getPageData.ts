import { notFound } from 'next/navigation'

import { getPublicRecentActivity } from '@/data/recentActivity/getPublicRecentActivity'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'

import { RECENT_ACTIVITY_PAGINATION } from './constants'
import { validatePageNum } from './pageValidator'

const MAX_PAGES = 10

export async function getPageData({
  countryCode,
  page,
  state,
}: {
  countryCode: SupportedCountryCodes
  page: string[]
  state?: string
}) {
  const { itemsPerPage } = RECENT_ACTIVITY_PAGINATION

  const pageNum = validatePageNum(page ?? [])
  if (!pageNum) {
    notFound()
  }
  const offset = (pageNum - 1) * itemsPerPage

  const publicRecentActivity = await getPublicRecentActivity({
    limit: itemsPerPage,
    offset,
    countryCode,
    ...(state && { stateCode: state.toUpperCase() }),
  })

  return {
    publicRecentActivity,
    totalPages: state
      ? Math.min(Math.ceil(publicRecentActivity.count / itemsPerPage), MAX_PAGES)
      : RECENT_ACTIVITY_PAGINATION.totalPages,
    pageNum,
    offset,
  }
}
