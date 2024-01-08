import { NEXT_PUBLIC_ENVIRONMENT } from '@/utils/shared/sharedEnv'
import * as Sentry from '@sentry/nextjs'

export class FetchReqError extends Error {
  constructor(
    public response: Response,
    errorName: string,
    public body?: unknown,
  ) {
    super(errorName)
  }
}

const maybeParseBody = async (response: Response) =>
  response
    .text()
    .then(x => {
      if (NEXT_PUBLIC_ENVIRONMENT !== 'local') {
        return x
      }
      // try and format stuff cleaner in local dev
      try {
        return JSON.stringify(JSON.parse(x), null, 4)
      } catch (e) {
        return x
      }
    })
    .catch(x => undefined)

const maybeWithoutQueryParams = (url: string) => {
  try {
    const urlParts = new URL(url)
    return `${urlParts.origin}${urlParts.pathname}`
  } catch (e) {
    return url
  }
}

export const fetchReq = async (
  url: string,
  options?: RequestInit,
  config?: { withScope?: (scope: Sentry.Scope) => void },
) => {
  const response = await fetch(url, options)
  if (response.status >= 200 && response.status < 300) {
    return response
  }
  const errorName = `${response.status} from ${options?.method || 'GET'} ${maybeWithoutQueryParams(
    url,
  )}`
  const error = new FetchReqError(response, errorName, await maybeParseBody(response))
  Sentry.withScope(scope => {
    scope.setTransactionName(errorName)
    scope.setFingerprint([url])
    scope.setTags({ domain: 'fetchReq' })
    scope.setExtras({ options, url })
    config?.withScope?.(scope)
    Sentry.captureException(error)
  })
  throw error
}
