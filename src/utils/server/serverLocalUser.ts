import { COOKIE_CONSENT_COOKIE_NAME, deserializeCookieConsent } from '@/utils/shared/cookieConsent'
import {
  CurrentSessionLocalUser,
  LOCAL_USER_CURRENT_SESSION_KEY,
  LOCAL_USER_PERSISTED_KEY,
  PersistedLocalUser,
} from '@/utils/shared/localUser'
import { getLogger } from '@/utils/shared/logger'
import { User } from '@prisma/client'
import * as Sentry from '@sentry/nextjs'
import { NextApiRequest } from 'next'
import { cookies } from 'next/headers'

const logger = getLogger(`serverLocalUser`)

type ServerLocalUser = {
  persisted: PersistedLocalUser
  currentSession: CurrentSessionLocalUser
}

import { object, record, string } from 'zod'

const zodServerLocalUser = object({
  persisted: object({
    initialSearchParams: record(string(), string()),
    initialReferer: string().optional(),
    datetimeFirstSeen: string(),
  }),
  currentSession: object({
    datetimeOnLoad: string(),
    refererOnLoad: string().optional(),
    searchParamsOnLoad: record(string(), string()),
  }),
})

export function mapLocalUserToUserDatabaseFields(
  localUser: ServerLocalUser | null,
): Pick<
  User,
  'acquisitionReferer' | 'acquisitionSource' | 'acquisitionMedium' | 'acquisitionCampaign'
> {
  return {
    acquisitionReferer: localUser?.persisted?.initialReferer || '',
    acquisitionSource:
      localUser?.persisted?.initialSearchParams.utm_source ||
      localUser?.currentSession.searchParamsOnLoad.utm_source ||
      '',
    acquisitionMedium:
      localUser?.persisted?.initialSearchParams.utm_medium ||
      localUser?.currentSession.searchParamsOnLoad.utm_medium ||
      '',
    acquisitionCampaign:
      localUser?.persisted?.initialSearchParams.utm_campaign ||
      localUser?.currentSession.searchParamsOnLoad.utm_campaign ||
      '',
  }
}

function parseFromCookieStrings({
  persistedStr,
  currentSessionStr,
  cookieConsentStr,
}: {
  cookieConsentStr: string | undefined
  persistedStr: string | undefined
  currentSessionStr: string | undefined
}) {
  if (!cookieConsentStr) {
    Sentry.captureMessage('serverLocalUser: no cookie consent string found')
    return null
  }
  const consent = deserializeCookieConsent(cookieConsentStr)
  if (!consent.targeting) {
    return null
  }
  if (!currentSessionStr || !persistedStr) {
    Sentry.captureMessage('serverLocalUser: cookie missing currentSession or persisted', {
      extra: { currentSessionStr, persistedStr, consent },
    })
    return null
  }
  try {
    const persisted = JSON.parse(persistedStr)
    const currentSession = JSON.parse(currentSessionStr)
    try {
      const localUser: ServerLocalUser = zodServerLocalUser.parse({ persisted, currentSession })
      return localUser
    } catch (e) {
      Sentry.captureMessage('serverLocalUser: JSON failed to validate', {
        extra: { persistedStr, currentSessionStr },
      })
      return null
    }
  } catch (e) {
    Sentry.captureMessage('serverLocalUser: cookie contained invalid JSON', {
      extra: { persistedStr, currentSessionStr },
    })
    return null
  }
}

export function parseLocalUserFromCookies() {
  const cookieObj = cookies()
  const persistedStr = cookieObj.get(LOCAL_USER_PERSISTED_KEY)?.value
  const currentSessionStr = cookieObj.get(LOCAL_USER_CURRENT_SESSION_KEY)?.value
  const cookieConsentStr = cookieObj.get(COOKIE_CONSENT_COOKIE_NAME)?.value
  return parseFromCookieStrings({ persistedStr, currentSessionStr, cookieConsentStr })
}

export function parseLocalUserFromCookiesForPageRouter(req: NextApiRequest) {
  const persistedStr = req.cookies[LOCAL_USER_PERSISTED_KEY]
  const currentSessionStr = req.cookies[LOCAL_USER_CURRENT_SESSION_KEY]
  const cookieConsentStr = req.cookies[COOKIE_CONSENT_COOKIE_NAME]
  return parseFromCookieStrings({ persistedStr, currentSessionStr, cookieConsentStr })
}
