export const REDIS_KEYS = {
  DISTRICT_ADVOCATES_RANKING: 'district:ranking:advocates',
  DISTRICT_REFERRALS_RANKING: 'district:ranking:referrals',
} as const

export const CURRENT_DISTRICT_RANKING = REDIS_KEYS.DISTRICT_ADVOCATES_RANKING
