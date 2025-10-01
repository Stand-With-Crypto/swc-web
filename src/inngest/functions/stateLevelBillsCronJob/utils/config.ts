import {
  BuilderIOBillPublishedState,
  QuorumBillApiSortKey,
} from '@/inngest/functions/stateLevelBillsCronJob/utils/types'

export const BUILDER_IO_BILLS_PER_PAGE = 100

export const CRYPTO_RELATED_KEYWORDS: Lowercase<string>[] = [
  // 'bitcoin',
  // 'blockchain',
  // 'cbdc',
  // 'central bank digital currency',
  'crypto',
  'cryptocurrencies',
  'cryptocurrency',
  // 'decentralized finance',
  // 'defi',
  // 'digital asset',
  // 'digital assets',
  // 'digital commodities',
  // 'doge',
  // 'ethereum',
  // 'nft',
  // 'non fungible token',
  // 'non-fungible token',
  // 'smart contract',
  // 'stablecoin',
  // 'stablecoins',
  // 'web 3',
  // 'web3',
]

export const QUORUM_API_BILLS_PER_PAGE = 100

export const QUORUM_API_BILL_SORT_KEY: QuorumBillApiSortKey = 'introduced_date'

export const QUORUM_API_BILL_STARTING_YEAR = 2020

export const QUORUM_API_BILL_ENDPOINT = 'newbill'
export const QUORUM_API_BILL_SUMMARY_ENDPOINT = 'newbillsummary'

export const BUILDER_IO_BILL_PREFIX = '[quorum]'
export const BUILDER_IO_BILL_PUBLISHED_STATE: BuilderIOBillPublishedState = 'draft'

export const MAX_BILLS_TO_PROCESS = 0 // no limit

export const MAX_MINOR_MILESTONES_ALLOWED = 5

export const STATE_LEVEL_BILLS_CRON_JOB_SCHEDULE = '0 8 * * 1-5' // every workday at 8 AM EST

export const SEARCH_OFFSET_REDIS_KEY = 'bill-automation-last-analyzed'
export const SEARCH_OFFSET_REDIS_TTL = 2 * 24 * 60 * 60 // 2 days

export const AI_ANALYSIS_BATCH_DELAY_IN_SECONDS = 60
export const AI_ANALYSIS_BATCH_LENGTH = 10
export const AI_ANALYSIS_MAX_OUTPUT_TOKENS = 300
export const AI_ANALYSIS_MAX_RETRIES = 3
export const AI_ANALYSIS_MIN_SCORE = 80
export const AI_ANALYSIS_MIN_TIMEOUT = 3_000
export const AI_ANALYSIS_TEMPERATURE = 0.1
