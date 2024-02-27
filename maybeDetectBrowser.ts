import { detect } from 'detect-browser'

export function maybeDetectBrowser() {
  try {
    return detect()
  } catch (e) {
    console.error(e)
    console.warn('maybeDetectBrowser crashed')
    return null
  }
}

function maybeParseNumber(str: string) {
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
export function getIsSupportedBrowser(browser: ReturnType<typeof detect>) {
  if (!browser) {
    return true
  }
  switch (browser.name) {
    case 'phantomjs':
    case 'curl':
      return false
    case 'chrome': {
      const version = maybeParseNumber(browser.version)
      if (!version) {
        return true
      }
      return version > 90
    }
    case 'ios': {
      const version = maybeParseNumber(browser.version)
      if (!version) {
        return true
      }
      return version >= 13
    }
  }
  return true
}
