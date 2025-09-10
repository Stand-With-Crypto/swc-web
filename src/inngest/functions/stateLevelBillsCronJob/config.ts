import { QuorumBillApiSortKey } from '@/inngest/functions/stateLevelBillsCronJob/types'

export const BUILDER_IO_ITEMS_PER_PAGE = 100

export const CRYPTO_RELATED_KEYWORDS: Lowercase<string>[] = [
  'bitcoin',
  'blockchain',
  'cbdc',
  'central bank digital currency',
  'crypto',
  'cryptocurrencies',
  'cryptocurrency',
  'decentralized finance',
  'defi',
  'digital asset',
  'digital assets',
  'digital commodities',
  'doge',
  'ethereum',
  'nft',
  'non fungible token',
  'non-fungible token',
  'smart contract',
  'stablecoin',
  'stablecoins',
  'web 3',
  'web3',
]

export const QUORUM_API_ITEMS_PER_PAGE = 100

export const QUORUM_API_SORT_KEY: QuorumBillApiSortKey = 'introduced_date'

export const QUORUM_API_STARTING_YEAR = 2020

export const QUORUM_API_BILL_ENDPOINT = 'newbill'
export const QUORUM_API_BILL_SUMMARY_ENDPOINT = 'newbillsummary'

export const BUILDER_IO_BILL_PREFIX = '[quorum]'
export const BUILDER_IO_BILL_PUBLISHED_STATE: 'archived' | 'draft' | 'published' = 'draft'

export const STATE_LEVEL_BILLS_CRON_JOB_SCHEDULE = '0 8 * * 1-5'
