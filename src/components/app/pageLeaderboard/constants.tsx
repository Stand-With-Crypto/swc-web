import { toBool } from '@/utils/shared/toBool'

export const PAGE_LEADERBOARD_TOTAL_PAGES = 50

export const PAGE_LEADERBOARD_TOTAL_PRE_GENERATED_PAGES = toBool(
  process.env.MINIMIZE_PAGE_PRE_GENERATION,
)
  ? 1
  : PAGE_LEADERBOARD_TOTAL_PAGES

export const PAGE_LEADERBOARD_ITEMS_PER_PAGE = 30
