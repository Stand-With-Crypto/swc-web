import * as Sentry from '@sentry/nextjs'

// getting "JSON.stringify cannot serialize cyclic structures." errors.
// this function should help identify the issues
export function safeStringify(...params: Parameters<typeof JSON.stringify>) {
  try {
    return JSON.stringify(...params)
  } catch {
    // https://stackoverflow.com/a/9382383
    const seen: any = []
    const result = JSON.stringify(params[0], (_, val) => {
      if (val !== null && typeof val === 'object') {
        if (seen.indexOf(val) >= 0) {
          return
        }
        seen.push(val)
      }
      return val
    })
    Sentry.captureMessage('JSON.stringify broken unexpectedly', {
      extra: { safeStringifyResult: result },
    })
    return result
  }
}
