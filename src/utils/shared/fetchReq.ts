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
      try {
        return { type: 'json' as const, value: JSON.stringify(JSON.parse(x), null, 4) }
      } catch {
        if (x.includes('<html')) {
          return { type: 'html' as const, value: x }
        }
        return { type: 'string' as const, value: x }
      }
    })
    .catch(() => undefined)

const maybeWithoutQueryParams = (url: string) => {
  try {
    if (url.startsWith('/')) {
      return url.split('?')[0]
    }

    const urlParts = new URL(url)
    return `${urlParts.origin}${urlParts.pathname}`
  } catch {
    return url
  }
}

const formatErrorNameWithBody = (val: Awaited<ReturnType<typeof maybeParseBody>>) => {
  switch (val?.type) {
    case 'string':
      return ` ${val.value}`
    case 'html':
      return ' with html response'
    case 'json':
      return ' with json response'
    default:
      return ''
  }
}

export const fetchReq = async (
  url: string,
  options?: RequestInit,
  config?: {
    withScope?: (scope: Sentry.Scope) => void
    isValidRequest?: (response: Response) => boolean
  },
) => {
  const response = await fetch(url, options)
  if (
    config?.isValidRequest
      ? config.isValidRequest(response)
      : response.status >= 200 && response.status < 300
  ) {
    return response
  }
  const maybeBody = await maybeParseBody(response)
  const urlWithoutQueryParams = maybeWithoutQueryParams(url)
  const errorName = `${response.status} from ${options?.method || 'GET'} ${urlWithoutQueryParams}${formatErrorNameWithBody(maybeBody)}`
  const error = new FetchReqError(response, errorName, maybeBody?.value)
  Sentry.withScope(scope => {
    scope.setTransactionName(errorName)
    scope.setFingerprint([errorName])
    scope.setTags({ domain: 'fetchReq' })
    scope.setExtras({ options, url })
    config?.withScope?.(scope)
    Sentry.captureException(error)
  })
  throw error
}
