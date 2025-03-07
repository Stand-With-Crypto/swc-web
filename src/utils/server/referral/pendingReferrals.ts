import { redis } from '@/utils/server/redis'
import { logger } from '@/utils/shared/logger'

const PENDING_REFERRALS_QUEUE = 'pending-referrals'

type PendingReferral = {
  referralId: string
  userId: string
}

type PendingReferralEntry = {
  referralId: string
  userId: string
  timestamp: number
  retriesCount: number
}

export function isValidPendingReferralEntry(value: unknown): value is PendingReferralEntry {
  return (
    typeof value === 'object' &&
    value !== null &&
    'referralId' in value &&
    'userId' in value &&
    'timestamp' in value &&
    typeof (value as PendingReferralEntry).referralId === 'string' &&
    typeof (value as PendingReferralEntry).userId === 'string' &&
    typeof (value as PendingReferralEntry).timestamp === 'number' &&
    typeof (value as PendingReferralEntry).retriesCount === 'number'
  )
}

export async function addToPendingReferralsQueue(referral: PendingReferral) {
  const pendingReferral = {
    ...referral,
    timestamp: Date.now(),
    retriesCount: 0,
  }

  await redis.lpush<PendingReferralEntry>(PENDING_REFERRALS_QUEUE, pendingReferral)
  logger.info(`Added to pending referrals queue`, pendingReferral)
}

export async function getPendingReferrals(limit = 100) {
  const rawReferrals = await redis.rpop<PendingReferralEntry[]>(PENDING_REFERRALS_QUEUE, limit)
  if (!rawReferrals) return []

  const referrals = Array.isArray(rawReferrals) ? rawReferrals : [rawReferrals]

  return referrals
}
