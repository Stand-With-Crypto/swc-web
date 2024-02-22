import { toBool } from '@/utils/shared/toBool'

export const PAGE_LEADERBOARD_TOTAL_PAGES = 25

export const PAGE_LEADERBOARD_TOTAL_PRE_GENERATED_PAGES = toBool(
  process.env.MINIMIZE_PAGE_PRE_GENERATION,
)
  ? 1
  : 25

export const PAGE_LEADERBOARD_ITEMS_PER_PAGE = 30
