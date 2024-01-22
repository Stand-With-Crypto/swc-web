import { inngest } from '@/inngest/inngest'
import {
  createAdvocateInCapitolCanary,
  createAdvocateSchema,
} from '@/utils/server/capitolCanary/createAdvocateInCapitolCanary'
import { NonRetriableError, RetryAfterError } from 'inngest'
import * as Sentry from '@sentry/nextjs'

const CREATE_CAPITOL_CANARY_ADVOCATE_RETRY_LIMIT = 1
const CREATE_CAPITOL_CANARY_ADVOCATE_RETRY_TIMEOUT = 2 * 1000 // 2 seconds

export const createAdvocateInCapitolCanaryWithInngest = inngest.createFunction(
  {
    id: 'capitol-canary.create-advocate',
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
  async ({ event, step }) => {
    const parseRequest = await createAdvocateSchema.safeParseAsync(event.data)
    if (parseRequest.success === false) {
      // Do not retry for invalid requests.
      throw new NonRetriableError('invalid request for creating capitol canary advocate', {
        cause: parseRequest.error,
      })
    }

    await step.run('capitol-canary.create-advocate-api-call', async () => {
      try {
        const response = createAdvocateInCapitolCanary(parseRequest.data)
        return {
          event,
          ...response,
        }
      } catch (error) {
        throw new RetryAfterError(
          'failed to create advocate in capitol canary',
          CREATE_CAPITOL_CANARY_ADVOCATE_RETRY_TIMEOUT,
          {
            cause: error,
          },
        )
      }
    })
  },
)
