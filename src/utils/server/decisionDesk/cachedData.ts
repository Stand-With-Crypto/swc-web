import { SetCommandOptions } from '@upstash/redis'

import { redis } from '@/utils/server/redis'
import { US_STATE_CODE_TO_DISPLAY_NAME_MAP } from '@/utils/shared/usStateUtils'

enum DecisionDeskKeys {
  SWC_ALL_RACES_DATA = 'SWC_ALL_RACES_DATA',
  SWC_ALL_CONGRESS_DATA = 'SWC_ALL_CONGRESS_DATA',
  SWC_PRESIDENTIAL_RACES_DATA = 'SWC_PRESIDENTIAL_RACES_DATA',
  SWC_DECISION_DESK_BEARER_TOKEN = 'SWC_DECISION_DESK_BEARER_TOKEN',
}

type StateRaceKeys = `${keyof typeof US_STATE_CODE_TO_DISPLAY_NAME_MAP}_STATE_RACES_DATA`

type DecisionDeskRedisKeys = keyof typeof DecisionDeskKeys | StateRaceKeys

export async function setDecisionDataOnRedis(
  key: DecisionDeskRedisKeys,
  value: string,
  opts?: SetCommandOptions,
) {
  return redis.set(key, value, opts ?? { ex: 86400 })
}

export async function getDecisionDataFromRedis<T extends object>(key: DecisionDeskRedisKeys) {
  return redis.get<T>(key)
}
