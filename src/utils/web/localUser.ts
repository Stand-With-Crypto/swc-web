import * as Sentry from '@sentry/nextjs'
import { getLocalStorage, removeLocalStorage, setLocalStorage } from '@/utils/web/localStorage'
import { getCookieConsent } from '@/utils/web/cookieConsent'

interface PersistedLocalUser {
  initialSearchParams: Record<string, string | undefined>
  initialReferer: string | null
  datetimeFirstSeen: string
}

interface CurrentSessionLocalUser {
  datetimeOnLoad: string
  refererOnLoad: string | null
  searchParamsOnLoad: Record<string, string | undefined>
}

export interface LocalUser {
  // this field will be null if the user has opted out of tracking
  persisted: PersistedLocalUser | null
  currentSession: CurrentSessionLocalUser
}

const LOCAL_USER_KEY = 'SWC_LOCAL_USER'

const persistLocalUser = (localUser: PersistedLocalUser) => {
  setLocalStorage(LOCAL_USER_KEY, localUser)
}

const getDefaultCurrentSessionLocalUser = (): CurrentSessionLocalUser => ({
  datetimeOnLoad: new Date().toISOString(),
  refererOnLoad: window.document.referrer,
  searchParamsOnLoad: Object.fromEntries(new URLSearchParams(window.location.search)),
})

const getDefaultPersistedLocalUser = (): PersistedLocalUser => ({
  initialReferer: window.document.referrer,
  datetimeFirstSeen: new Date().toISOString(),
  initialSearchParams: Object.fromEntries(new URLSearchParams(window.location.search)),
})

let localUser: LocalUser | null = null

export const setCurrentSessionLocalUser = (partial: Partial<CurrentSessionLocalUser>) => {
  if (!localUser) {
    Sentry.captureMessage('setCurrentSessionLocalUser called before getLocalUser', {
      extra: { partial },
    })
    return
  }
  const newPersist: CurrentSessionLocalUser = { ...localUser.currentSession, ...partial }
  localUser.currentSession = newPersist
}

// util to signify you want to set up the local user but don't need the value
export const bootstrapLocalUser = () => {
  getLocalUser()
}

export const getLocalUser = (): LocalUser => {
  const canUsePersistedData = getCookieConsent().targeting
  if (localUser) {
    if (!canUsePersistedData) {
      if (localUser.persisted) {
        removeLocalStorage(LOCAL_USER_KEY)
      }
      localUser = { currentSession: localUser.currentSession, persisted: null }
      return localUser
    }
    return localUser
  }
  const currentSession: CurrentSessionLocalUser = getDefaultCurrentSessionLocalUser()
  if (!canUsePersistedData) {
    localUser = { currentSession, persisted: null }
    return localUser
  }
  const persisted = getLocalStorage<PersistedLocalUser>(LOCAL_USER_KEY)
  if (persisted) {
    return { currentSession, persisted }
  }
  const newPersisted = getDefaultPersistedLocalUser()
  persistLocalUser(newPersisted)
  localUser = { currentSession, persisted: newPersisted }
  return localUser
}

export const setPersistLocalUser = (partial: Partial<PersistedLocalUser>) => {
  if (!localUser) {
    Sentry.captureMessage('setPersistLocalUser called before getLocalUser', {
      extra: { persist: partial },
    })
    return
  }
  if (!getCookieConsent().targeting) {
    return
  }
  const newPersist: PersistedLocalUser = {
    ...(localUser.persisted || getDefaultPersistedLocalUser()),
    ...partial,
  }
  persistLocalUser(newPersist)
  localUser.persisted = newPersist
}
