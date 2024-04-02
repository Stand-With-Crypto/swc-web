import * as Sentry from '@sentry/nextjs'

import { fetchReq, FetchReqError } from '@/utils/shared/fetchReq'
import { requiredOutsideLocalEnv } from '@/utils/shared/requiredEnv'

const CAPITOL_CANARY_API_KEY = requiredOutsideLocalEnv(
  process.env.CAPITOL_CANARY_API_KEY,
  'CAPITOL_CANARY_API_KEY',
  'Capitol Canary integration',
)!

const CAPITOL_CANARY_API_SECRET = requiredOutsideLocalEnv(
  process.env.CAPITOL_CANARY_API_SECRET,
  'CAPITOL_CANARY_API_SECRET',
  'Capitol Canary integration',
)!

export async function sendCapitolCanaryRequest<T, R>(
  request: T,
  httpMethod: 'GET' | 'POST',
  url: string,
): Promise<R> {
  if (httpMethod === 'GET') {
    const urlParams = new URLSearchParams(request as Record<string, string>)
    url = `${url}?${urlParams.toString()}`
  }
  try {
    const httpResp = await fetchReq(url, {
      method: httpMethod,
      headers: {
        Authorization: `Basic ${btoa(`${CAPITOL_CANARY_API_KEY}:${CAPITOL_CANARY_API_SECRET}`)}`,
        'Content-Type': 'application/json',
      },
      ...(httpMethod === 'POST' && { body: JSON.stringify(request) }),
    })
    return (await httpResp.json()) as R
  } catch (error) {
    Sentry.captureException(error, {
      level: 'error',
    })
    if (
      error instanceof FetchReqError &&
      error.response?.status >= 400 &&
      error.response?.status < 500
    ) {
      return JSON.parse(error.body as string) as R
    }
    throw error
  }
}
