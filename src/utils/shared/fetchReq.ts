import { NEXT_PUBLIC_ENVIRONMENT } from '@/utils/shared/sharedEnv'
import * as Sentry from '@sentry/nextjs'

export class FetchReqError extends Error {
  constructor(
    public response: Response,
    public body?: unknown,
  ) {
    super(response.statusText)
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

export const fetchReq = async (url: string, options?: RequestInit) => {
  const response = await fetch(url, options)
  if (response.status >= 200 && response.status < 300) {
    return response
  }
  const error = new FetchReqError(response, await maybeParseBody(response))
  Sentry.captureException(error, {
    tags: { domain: 'fetchReq' },
    fingerprint: [url],
    extra: { options, url },
  })
  throw error
}
