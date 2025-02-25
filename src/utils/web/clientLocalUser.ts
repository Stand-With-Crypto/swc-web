import Cookies from 'js-cookie'

import { isBrowser } from '@/utils/shared/executionEnvironment'
import {
  CurrentSessionLocalUser,
  LOCAL_USER_CURRENT_SESSION_KEY,
  LOCAL_USER_PERSISTED_KEY,
  LocalUser,
  PersistedLocalUser,
} from '@/utils/shared/localUser'
import { getLogger } from '@/utils/shared/logger'
import { getClientCookieConsent } from '@/utils/web/clientCookieConsent'
import { getAllExperiments } from '@/utils/web/clientExperiments'
import { getCountryCodeOnClient } from '@/utils/web/getCountryCodeOnClient'

const getPersistedLocalUser = () => {
  const val = Cookies.get(LOCAL_USER_PERSISTED_KEY)
  if (val) {
    return JSON.parse(val) as PersistedLocalUser
  }
  return null
}

const removeLocalUser = () => {
  Cookies.remove(LOCAL_USER_PERSISTED_KEY)
  Cookies.remove(LOCAL_USER_CURRENT_SESSION_KEY)
}

const getDefaultCurrentSessionLocalUser = (countryCode: string): CurrentSessionLocalUser => ({
  datetimeOnLoad: new Date().toISOString(),
  refererOnLoad: window.document.referrer || undefined,
  searchParamsOnLoad: Object.fromEntries(new URLSearchParams(window.location.search)),
  countryCode,
})

const getDefaultPersistedLocalUser = (countryCode: string): PersistedLocalUser => ({
  initialReferer: window.document.referrer || undefined,
  datetimeFirstSeen: new Date().toISOString(),
  initialSearchParams: Object.fromEntries(new URLSearchParams(window.location.search)),
  experiments: getAllExperiments(null).experiments,
  countryCode,
})

let localUser: LocalUser | null = null

// util to signify you want to set up the local user but don't need the value
export const bootstrapLocalUser = () => {
  getLocalUser()
}

const logger = getLogger('getLocalUser')

export const getLocalUser = (): LocalUser => {
  if (!isBrowser) {
    return {
      currentSession: {
        refererOnLoad: undefined,
        datetimeOnLoad: new Date().toISOString(),
        searchParamsOnLoad: {},
        countryCode: undefined,
      },
      persisted: undefined,
    }
  }
  const canUsePersistedData =
    getClientCookieConsent().targeting && getClientCookieConsent().functional

  const countryCode = getCountryCodeOnClient()

  if (localUser) {
    if (!canUsePersistedData) {
      if (localUser.persisted) {
        logger.info('targeting permissions have changed: removing persisted data')
        removeLocalUser()
      }
      localUser = { currentSession: localUser.currentSession, persisted: undefined }
      return localUser
    }
    return localUser
  }

  const currentSession: CurrentSessionLocalUser = getDefaultCurrentSessionLocalUser(countryCode)

  if (!canUsePersistedData) {
    localUser = { currentSession, persisted: undefined }
    return localUser
  }
  Cookies.set(LOCAL_USER_CURRENT_SESSION_KEY, JSON.stringify(currentSession), {
    expires: 1,
  })
  const persisted = getPersistedLocalUser()
  if (persisted) {
    const experimentResults = getAllExperiments(persisted)
    if (!experimentResults.hasUpdates) {
      return { currentSession, persisted }
    }
    logger.info('new experiments, updating existed persisted data')
    const newPersisted = {
      ...persisted,
      experiments: experimentResults.experiments,
      countryCode: persisted?.countryCode ?? countryCode,
    }
    Cookies.set(LOCAL_USER_PERSISTED_KEY, JSON.stringify(newPersisted), {
      expires: 365,
    })
    localUser = { currentSession, persisted: newPersisted }
    return localUser
  }
  logger.info('no data, setting new persisted data')
  const newPersisted = getDefaultPersistedLocalUser(countryCode)
  Cookies.set(LOCAL_USER_PERSISTED_KEY, JSON.stringify(newPersisted), {
    expires: 365,
  })
  localUser = { currentSession, persisted: newPersisted }
  return localUser
}

export function setLocalUserPersistedValues(values: Partial<PersistedLocalUser>) {
  const canUsePersistedData =
    getClientCookieConsent().targeting && getClientCookieConsent().functional
  if (!canUsePersistedData) {
    return
  }
  const newPersisted = { ...getLocalUser().persisted, ...values }
  Cookies.set(LOCAL_USER_PERSISTED_KEY, JSON.stringify(newPersisted), {
    expires: 365,
  })
  localUser = null
}
