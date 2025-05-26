import { notFound } from 'next/navigation'

import { getPublicRecentActivity } from '@/data/recentActivity/getPublicRecentActivity'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'

import { RECENT_ACTIVITY_PAGINATION } from './constants'
import { validatePageNum } from './pageValidator'

export async function getPageData(
  {
    page,
    countryCode,
  }: {
    countryCode: SupportedCountryCodes
    page: string[]
  },
  searchParams?: { state?: string },
) {
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
    ...(searchParams?.state && { stateCode: searchParams.state.toUpperCase() }),
  })

  return {
    publicRecentActivity,
    totalPages: searchParams?.state
      ? Math.ceil(publicRecentActivity.count / itemsPerPage)
      : RECENT_ACTIVITY_PAGINATION.totalPages,
    pageNum,
    offset,
  }
}
