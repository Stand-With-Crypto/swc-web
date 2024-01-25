import { FetchReqError, fetchReq } from '@/utils/shared/fetchReq'
import { requiredEnv } from '@/utils/shared/requiredEnv'
import * as Sentry from '@sentry/nextjs'

const CAPITOL_CANARY_API_KEY = requiredEnv(
  process.env.CAPITOL_CANARY_API_KEY,
  'process.env.CAPITOL_CANARY_API_KEY',
)

const CAPITOL_CANARY_API_SECRET = requiredEnv(
  process.env.CAPITOL_CANARY_API_SECRET,
  'process.env.CAPITOL_CANARY_API_SECRET',
)

export async function sendCapitolCanaryRequest<T, R>(
  request: T,
  httpMethod: 'GET' | 'POST',
  url: string,
): Promise<R> {
  try {
    const httpResp = await fetchReq(url, {
      method: httpMethod,
      headers: {
        Authorization: `Basic ${btoa(`${CAPITOL_CANARY_API_KEY}:${CAPITOL_CANARY_API_SECRET}`)}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
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
