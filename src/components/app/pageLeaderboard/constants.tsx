import { toBool } from '@/utils/shared/toBool'

export const PAGE_LEADERBOARD_TOTAL_PAGES = 10

export const PAGE_LEADERBOARD_TOTAL_PRE_GENERATED_PAGES = toBool(
  process.env.MINIMIZE_PAGE_PRE_GENERATION,
)
  ? 1
  : 3 // TODO set this back to all pages after we figure out why builds fail for these pages

export const PAGE_LEADERBOARD_ITEMS_PER_PAGE = 30
