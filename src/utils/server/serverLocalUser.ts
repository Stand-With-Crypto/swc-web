import { User } from '@prisma/client'
import * as Sentry from '@sentry/nextjs'
import { cookies } from 'next/headers'
import { any, object, record, string } from 'zod'

import { getTenantId } from '@/utils/server/getTenantId'
import { COOKIE_CONSENT_COOKIE_NAME, deserializeCookieConsent } from '@/utils/shared/cookieConsent'
import {
  CurrentSessionLocalUser,
  LOCAL_USER_CURRENT_SESSION_KEY,
  LOCAL_USER_PERSISTED_KEY,
  PersistedLocalUser,
} from '@/utils/shared/localUser'

export type ServerLocalUser = {
  persisted: PersistedLocalUser
  currentSession: CurrentSessionLocalUser
}

const zodServerLocalUser = object({
  persisted: object({
    initialSearchParams: record(string(), string()),
    initialReferer: string().optional(),
    datetimeFirstSeen: string(),
    experiments: any(),
    countryCode: string(),
  }),
  currentSession: object({
    datetimeOnLoad: string(),
    refererOnLoad: string().optional(),
    searchParamsOnLoad: record(string(), string()),
    countryCode: string(),
  }),
})

// needed to reuse logic from our analytics library when we're interacting with third party webhooks/api endpoints that wont have the site headers
export function getLocalUserFromUser(user: User): ServerLocalUser {
  return {
    persisted: {
      initialSearchParams: {
        utm_source: user.acquisitionSource,
        utm_medium: user.acquisitionMedium,
        utm_campaign: user.acquisitionCampaign,
      },
      initialReferer: '',
      datetimeFirstSeen: user.datetimeCreated.toISOString(),
      countryCode: user.tenantId,
    },
    currentSession: {
      datetimeOnLoad: user.datetimeCreated.toISOString(),
      refererOnLoad: '',
      searchParamsOnLoad: {},
      countryCode: user.tenantId,
    },
  }
}

export function mapLocalUserToUserDatabaseFields(
  localUser: ServerLocalUser | null,
): Pick<
  User,
  | 'acquisitionReferer'
  | 'acquisitionSource'
  | 'acquisitionMedium'
  | 'acquisitionCampaign'
  | 'tenantId'
> {
  return {
    // We are trimming the char input in case it is greater than the DB limit (191 characters)
    acquisitionReferer: localUser?.persisted?.initialReferer?.slice(0, 191) || '',
    acquisitionSource:
      localUser?.persisted?.initialSearchParams.utm_source?.slice(0, 191) ||
      localUser?.currentSession.searchParamsOnLoad.utm_source?.slice(0, 191) ||
      '',
    acquisitionMedium:
      localUser?.persisted?.initialSearchParams.utm_medium?.slice(0, 191) ||
      localUser?.currentSession.searchParamsOnLoad.utm_medium?.slice(0, 191) ||
      '',
    acquisitionCampaign:
      localUser?.persisted?.initialSearchParams.utm_campaign?.slice(0, 191) ||
      localUser?.currentSession.searchParamsOnLoad.utm_campaign?.slice(0, 191) ||
      '',
    tenantId: localUser?.persisted?.countryCode || localUser?.currentSession.countryCode || '',
  }
}

function parseFromCookieStrings({
  persistedStr,
  currentSessionStr,
  cookieConsentStr,
  source,
  countryCode,
}: {
  source: string
  cookieConsentStr: string | undefined
  persistedStr: string | undefined
  currentSessionStr: string | undefined
  countryCode: string
}) {
  if (cookieConsentStr && !deserializeCookieConsent(cookieConsentStr).targeting) {
    return null
  }
  if (!currentSessionStr || !persistedStr) {
    return null
  }
  try {
    const persisted = JSON.parse(persistedStr) as PersistedLocalUser
    const currentSession = JSON.parse(currentSessionStr) as CurrentSessionLocalUser

    try {
      // We are adding the country code in case it doesn't exist to support the incremental adoption of the new local user object type.
      const localUser: ServerLocalUser = zodServerLocalUser.parse({
        persisted: { ...persisted, countryCode: persisted?.countryCode ?? countryCode },
        currentSession: {
          ...currentSession,
          countryCode: currentSession?.countryCode ?? countryCode,
        },
      })
      return localUser
    } catch {
      Sentry.captureMessage('serverLocalUser: JSON failed to validate', {
        extra: { persistedStr, currentSessionStr },
        tags: { source },
      })
      return null
    }
  } catch {
    Sentry.captureMessage('serverLocalUser: cookie contained invalid JSON', {
      extra: { persistedStr, currentSessionStr },
      tags: { source },
    })
    return null
  }
}

export async function parseLocalUserFromCookies() {
  const cookieObj = await cookies()
  const countryCode = await getTenantId()
  const persistedStr = cookieObj.get(LOCAL_USER_PERSISTED_KEY)?.value
  const currentSessionStr = cookieObj.get(LOCAL_USER_CURRENT_SESSION_KEY)?.value
  const cookieConsentStr = cookieObj.get(COOKIE_CONSENT_COOKIE_NAME)?.value
  return parseFromCookieStrings({
    persistedStr,
    currentSessionStr,
    cookieConsentStr,
    source: 'app-router',
    countryCode,
  })
}
