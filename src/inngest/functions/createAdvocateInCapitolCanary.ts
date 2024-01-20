import { inngest } from '@/inngest/inngest'
import {
  createAdvocateInCapitolCanary,
  createAdvocateSchema,
} from '@/utils/server/capitolCanary/createAdvocateInCapitolCanary'
import { NonRetriableError, RetryAfterError } from 'inngest'
import * as Sentry from '@sentry/nextjs'

const CREATE_CAPITOL_CANARY_ADVOCATE_RETRY_LIMIT = 1
const CREATE_CAPITOL_CANARY_ADVOCATE_RETRY_TIMEOUT = 5 * 1000 // 5 seconds

export const createAdvocateInCapitolCanaryWithInngest = inngest.createFunction(
  {
    id: 'create-capitol-canary-advocate',
    retries: CREATE_CAPITOL_CANARY_ADVOCATE_RETRY_LIMIT,
    onFailure: async ({ error }) => {
      Sentry.captureException(error, {
        level: 'error',
        tags: {
          domain: 'createAdvocateInCapitolCanaryWithInngest',
        },
      })
    },
  },
  { event: 'capitol-canary.create-advocate' },
  async ({ event }) => {
    const parseRequest = await createAdvocateSchema.safeParseAsync(event.data)
    if (parseRequest.success === false) {
      // Do not retry for invalid requests.
      throw new NonRetriableError('invalid request for creating capitol canary advocate', {
        cause: parseRequest.error,
      })
    }

    try {
      const response = await createAdvocateInCapitolCanary(parseRequest.data)
      return {
        event,
        ...response,
      }
    } catch (err) {
      throw new RetryAfterError(
        'failed to create advocate in capitol canary',
        CREATE_CAPITOL_CANARY_ADVOCATE_RETRY_TIMEOUT,
        {
          cause: err,
        },
      )
    }
  },
)
