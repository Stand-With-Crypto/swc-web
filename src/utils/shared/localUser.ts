import { ClientAddress } from '@/clientModels/clientAddress'

export interface PersistedLocalUser {
  initialSearchParams: Record<string, string>
  initialReferer?: string
  datetimeFirstSeen: string
  recentlyUsedAddress?: Pick<ClientAddress, 'googlePlaceId' | 'formattedDescription'>
  hasSeenCompleteProfilePrompt: boolean
}

export interface CurrentSessionLocalUser {
  datetimeOnLoad: string
  refererOnLoad?: string
  searchParamsOnLoad: Record<string, string>
}

export interface LocalUser {
  // this field will be undefined if the user has opted out of tracking
  persisted?: PersistedLocalUser
  currentSession: CurrentSessionLocalUser
}

export const LOCAL_USER_PERSISTED_KEY = 'SWC_LOCAL_USER_PERSISTED_KEY'
export const LOCAL_USER_CURRENT_SESSION_KEY = 'SWC_LOCAL_USER_CURRENT_SESSION_KEY'

export function mapPersistedLocalUserToAnalyticsProperties(
  persisted: PersistedLocalUser,
): Record<string, string | undefined> {
  return {
    'Initial Referer': persisted.initialReferer,
    'Datetime First Seen': persisted.datetimeFirstSeen,
    ...Object.entries(persisted.initialSearchParams).reduce(
      (accum, [key, val]) => {
        accum[`Initial Search Param ${key}`] = val
        return accum
      },
      {} as Record<string, string | undefined>,
    ),
  }
}

export function mapCurrentSessionLocalUserToAnalyticsProperties(
  currentSession: CurrentSessionLocalUser,
): Record<string, string | undefined> {
  return {
    'Referer On Load': currentSession.refererOnLoad,
    'Datetime On Load': currentSession.datetimeOnLoad,
    ...Object.entries(currentSession.searchParamsOnLoad).reduce(
      (accum, [key, val]) => {
        accum[`Search Param On Load ${key}`] = val
        return accum
      },
      {} as Record<string, string | undefined>,
    ),
  }
}
