import * as Bowser from 'bowser'

export function maybeDetectBrowser() {
  try {
    return Bowser.parse(window.navigator.userAgent)
  } catch (e) {
    console.error(e)
    console.warn('maybeDetectBrowser crashed')
    return null
  }
}

function maybeParseNumber(str?: string) {
  if (!str) {
    return null
  }
  try {
    return parseInt(str.split('.')[0], 10)
  } catch (e) {
    console.error(e)
    console.warn('maybeParseNumber crashed')
    return null
  }
}

/*
A few notes about this function
- Because this is called in sentry, we want to ensure it never crashes, hence the aggressively unnecessary try catching above out of paranoia
- We don't want to block any browsers unless we have a very high degree of confidence we know what we're blocking. Hence why the fn defaults to true
- this function will be expanded as we get sentry errors for additional legacy browsers
- sentry ignores a lot of legacy browsers by default so this list just includes the ones that aren't getting blocked by sentry
*/
export function getIsSupportedBrowser(data: Bowser.Parser.ParsedResult | null) {
  if (!data) {
    return true
  }
  switch (data.browser.name) {
    case 'Chrome': {
      const version = maybeParseNumber(data.browser.version)
      if (!version) {
        return true
      }
      return version > 106
    }
    case 'Samsung Internet for Android': {
      const version = maybeParseNumber(data.browser.version)
      if (!version) {
        return true
      }
      return version >= 13
    }
    case 'Safari': {
      const version = maybeParseNumber(data.browser.version)
      if (!version) {
        return true
      }
      return version >= 14
    }
  }
  switch (data.os.name) {
    case 'iOS': {
      const version = maybeParseNumber(data.os.version)

      if (!version) {
        return true
      }
      return version >= 14
    }
    case 'Android': {
      const version = maybeParseNumber(data.os.version)

      if (!version) {
        return true
      }
      return version >= 11
    }
  }
  return true
}
