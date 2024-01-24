import { inngest } from '@/inngest/inngest'
import { onFailureCapitolCanary } from '@/inngest/onFailureCapitolCanary'
import {
  CreateAdvocateInCapitolCanaryPayloadRequirements,
  createAdvocateInCapitolCanary,
  formatCapitolCanaryAdvocateCreationRequest,
} from '@/utils/server/capitolCanary/createAdvocate'
import { NonRetriableError } from 'inngest'

const CREATE_CAPITOL_CANARY_ADVOCATE_RETRY_LIMIT = 20

export const CREATE_CAPITOL_CANARY_ADVOCATE_INNGEST_FUNCTION_ID = 'capitol-canary.create-advocate'
export const CREATE_CAPITOL_CANARY_ADVOCATE_INNGEST_EVENT_NAME = 'capitol.canary/create.advocate'

/**
 * Refer to `src/bin/smokeTests/capitolCanary/createAdvocateWithInngest.ts` to see how to call this function.
 */
export const createAdvocateInCapitolCanaryWithInngest = inngest.createFunction(
  {
    id: CREATE_CAPITOL_CANARY_ADVOCATE_INNGEST_FUNCTION_ID,
    retries: CREATE_CAPITOL_CANARY_ADVOCATE_RETRY_LIMIT,
    onFailure: onFailureCapitolCanary,
  },
  { event: CREATE_CAPITOL_CANARY_ADVOCATE_INNGEST_EVENT_NAME },
  async ({ event, step }) => {
    const data = event.data as CreateAdvocateInCapitolCanaryPayloadRequirements
    const formattedRequest = formatCapitolCanaryAdvocateCreationRequest(data)
    // Do not retry if the request is invalid.
    if (formattedRequest instanceof Error) {
      throw new NonRetriableError(formattedRequest.message, {
        cause: formattedRequest,
      })
    }
    const stepResponse = await step.run('capitol-canary.create-advocate-api-call', async () => {
      return {
        event,
        ...(await createAdvocateInCapitolCanary(formattedRequest)),
      }
    })
    return stepResponse
  },
)
