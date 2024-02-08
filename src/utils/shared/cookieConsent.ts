export const COOKIE_CONSENT_COOKIE_NAME = 'SWC_COOKIE_CONSENT'

export enum OptionalCookieConsentTypes {
  FUNCTIONAL = 'functional',
  PERFORMANCE = 'performance',
  TARGETING = 'targeting',
}

export type CookieConsentPermissions = Record<OptionalCookieConsentTypes, boolean>

export function serializeCookieConsent(permissions: CookieConsentPermissions) {
  return Object.entries({ required: true, ...permissions })
    .map(([key, value]) => `${key}:${String(value)}`)
    .join(',')
}

export function deserializeCookieConsent(cookieValue: string): CookieConsentPermissions {
  const permissions: CookieConsentPermissions = {
    functional: false,
    performance: false,
    targeting: false,
  }
  cookieValue.split(',').forEach(permission => {
    const [key, value] = permission.split(':')
    permissions[key as OptionalCookieConsentTypes] = value === 'true'
  })
  return permissions
}

export const DEFAULT_COOKIE_CONSENT: Readonly<CookieConsentPermissions> = {
  functional: true,
  performance: true,
  targeting: true,
}
