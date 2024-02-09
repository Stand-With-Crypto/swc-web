import { COOKIE_CONSENT_COOKIE_NAME, deserializeCookieConsent } from '@/utils/shared/cookieConsent'
import {
  CurrentSessionLocalUser,
  LOCAL_USER_CURRENT_SESSION_KEY,
  LOCAL_USER_PERSISTED_KEY,
  PersistedLocalUser,
} from '@/utils/shared/localUser'
import { User } from '@prisma/client'
import * as Sentry from '@sentry/nextjs'
import { NextApiRequest } from 'next'
import { cookies } from 'next/headers'
import { object, record, string } from 'zod'

export type ServerLocalUser = {
  persisted: PersistedLocalUser
  currentSession: CurrentSessionLocalUser
}

const zodServerLocalUser = object({
  currentSession: object({
    datetimeOnLoad: string(),
    refererOnLoad: string().optional(),
    searchParamsOnLoad: record(string(), string()),
  }),
  persisted: object({
    datetimeFirstSeen: string(),
    initialReferer: string().optional(),
    initialSearchParams: record(string(), string()),
  }),
})

// needed to reuse logic from our analytics library when we're interacting with third party webhooks/api endpoints that wont have the site headers
export function getLocalUserFromUser(user: User): ServerLocalUser {
  return {
    currentSession: {
      datetimeOnLoad: user.datetimeCreated.toISOString(),
      refererOnLoad: '',
      searchParamsOnLoad: {},
    },
    persisted: {
      datetimeFirstSeen: user.datetimeCreated.toISOString(),
      initialReferer: '',
      initialSearchParams: {
        utm_campaign: user.acquisitionCampaign,
        utm_medium: user.acquisitionMedium,
        utm_source: user.acquisitionSource,
      },
    },
  }
}

export function mapLocalUserToUserDatabaseFields(
  localUser: ServerLocalUser | null,
): Pick<
  User,
  'acquisitionReferer' | 'acquisitionSource' | 'acquisitionMedium' | 'acquisitionCampaign'
> {
  return {
    acquisitionCampaign:
      localUser?.persisted?.initialSearchParams.utm_campaign ||
      localUser?.currentSession.searchParamsOnLoad.utm_campaign ||
      '',
    acquisitionMedium:
      localUser?.persisted?.initialSearchParams.utm_medium ||
      localUser?.currentSession.searchParamsOnLoad.utm_medium ||
      '',
    acquisitionReferer: localUser?.persisted?.initialReferer || '',
    acquisitionSource:
      localUser?.persisted?.initialSearchParams.utm_source ||
      localUser?.currentSession.searchParamsOnLoad.utm_source ||
      '',
  }
}

function parseFromCookieStrings({
  persistedStr,
  currentSessionStr,
  cookieConsentStr,
  source,
}: {
  source: string
  cookieConsentStr: string | undefined
  persistedStr: string | undefined
  currentSessionStr: string | undefined
}) {
  if (cookieConsentStr && !deserializeCookieConsent(cookieConsentStr).targeting) {
    return null
  }
  if (!currentSessionStr || !persistedStr) {
    Sentry.captureMessage('serverLocalUser: cookie missing currentSession or persisted', {
      extra: { cookieConsentStr, currentSessionStr, persistedStr },
      tags: { source },
    })
    return null
  }
  try {
    const persisted = JSON.parse(persistedStr)
    const currentSession = JSON.parse(currentSessionStr)
    try {
      const localUser: ServerLocalUser = zodServerLocalUser.parse({ currentSession, persisted })
      return localUser
    } catch (e) {
      Sentry.captureMessage('serverLocalUser: JSON failed to validate', {
        extra: { currentSessionStr, persistedStr },
        tags: { source },
      })
      return null
    }
  } catch (e) {
    Sentry.captureMessage('serverLocalUser: cookie contained invalid JSON', {
      extra: { currentSessionStr, persistedStr },
      tags: { source },
    })
    return null
  }
}

export function parseLocalUserFromCookies() {
  const cookieObj = cookies()
  const persistedStr = cookieObj.get(LOCAL_USER_PERSISTED_KEY)?.value
  const currentSessionStr = cookieObj.get(LOCAL_USER_CURRENT_SESSION_KEY)?.value
  const cookieConsentStr = cookieObj.get(COOKIE_CONSENT_COOKIE_NAME)?.value
  return parseFromCookieStrings({
    cookieConsentStr,
    currentSessionStr,
    persistedStr,
    source: 'app-router',
  })
}

export function parseLocalUserFromCookiesForPageRouter(req: NextApiRequest) {
  const persistedStr = req.cookies[LOCAL_USER_PERSISTED_KEY]
  const currentSessionStr = req.cookies[LOCAL_USER_CURRENT_SESSION_KEY]
  const cookieConsentStr = req.cookies[COOKIE_CONSENT_COOKIE_NAME]
  return parseFromCookieStrings({
    cookieConsentStr,
    currentSessionStr,
    persistedStr,
    source: 'page-router',
  })
}
