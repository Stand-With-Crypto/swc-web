import { inngest } from '@/inngest/inngest'
import { onFailureCapitolCanary } from '@/inngest/onFailureCapitolCanary'
import {
  CreateAdvocateInCapitolCanaryPayloadRequirements,
  createAdvocateInCapitolCanary,
  formatCapitolCanaryAdvocateCreationRequest,
} from '@/utils/server/capitolCanary/createAdvocateInCapitolCanary'
import { FetchReqError } from '@/utils/shared/fetchReq'
import { NonRetriableError, RetryAfterError } from 'inngest'

const CREATE_CAPITOL_CANARY_ADVOCATE_RETRY_LIMIT = 1
const CREATE_CAPITOL_CANARY_ADVOCATE_RETRY_TIMEOUT = 2 * 1000 // 2 seconds
const CREATE_CAPITOL_CANARY_ADVOCATE_API_CALL_STEP_ID = 'capitol-canary.create-advocate-api-call'

export const CREATE_CAPITOL_CANARY_ADVOCATE_FUNCTION_ID = 'capitol-canary.create-advocate'

export const createAdvocateInCapitolCanaryWithInngest = inngest.createFunction(
  {
    id: CREATE_CAPITOL_CANARY_ADVOCATE_FUNCTION_ID,
    retries: CREATE_CAPITOL_CANARY_ADVOCATE_RETRY_LIMIT,
    onFailure: async ({ error }) => {
      await onFailureCapitolCanary(CREATE_CAPITOL_CANARY_ADVOCATE_FUNCTION_ID, error)
    },
  },
  { event: CREATE_CAPITOL_CANARY_ADVOCATE_FUNCTION_ID },
  async ({ event, step }) => {
    const data = event.data as CreateAdvocateInCapitolCanaryPayloadRequirements
    const formattedRequest = await formatCapitolCanaryAdvocateCreationRequest(data)
    // Do not retry if the request is invalid.
    if (formattedRequest instanceof Error) {
      throw new NonRetriableError(formattedRequest.message, {
        cause: formattedRequest,
      })
    }
    const response = await step.run(CREATE_CAPITOL_CANARY_ADVOCATE_API_CALL_STEP_ID, async () => {
      try {
        const capitolCanaryResponse = await createAdvocateInCapitolCanary(formattedRequest)
        return {
          event,
          ...capitolCanaryResponse,
        }
      } catch (error) {
        throw new RetryAfterError(
          error instanceof FetchReqError
            ? error.message
            : 'unknown error when creating advocate in capitol canary',
          CREATE_CAPITOL_CANARY_ADVOCATE_RETRY_TIMEOUT,
          {
            cause: error instanceof FetchReqError ? error : undefined,
          },
        )
      }
    })
    return response
  },
)
