import { inngest } from '@/inngest/inngest'
import { onFailureCapitolCanary } from '@/inngest/onFailureCapitolCanary'
import {
  createAdvocateInCapitolCanary,
  formatCapitolCanaryAdvocateCreationRequest,
} from '@/utils/server/capitolCanary/createAdvocate'
import {
  emailRepViaCapitolCanary,
  formatCapitolCanaryEmailRepRequest,
} from '@/utils/server/capitolCanary/emailRep'
import { EmailRepViaCapitolCanaryPayloadRequirements } from '@/utils/server/capitolCanary/payloadRequirements'
import { NonRetriableError } from 'inngest'

const CAPITOL_CANARY_EMAIL_REP_RETRY_LIMIT = 20

export const CAPITOL_CANARY_EMAIL_REP_INNGEST_FUNCTION_ID = 'capitol-canary.email-rep'
export const CAPITOL_CANARY_EMAIL_REP_INNGEST_EVENT_NAME = 'capitol.canary/email.rep'

/**
 * Refer to `src/bin/smokeTests/capitolCanary/createAdvocateWithInngest.ts` to see how to call this function.
 */
export const emailRepsViaCapitolCanaryWithInngest = inngest.createFunction(
  {
    id: CAPITOL_CANARY_EMAIL_REP_INNGEST_FUNCTION_ID,
    retries: CAPITOL_CANARY_EMAIL_REP_RETRY_LIMIT,
    onFailure: onFailureCapitolCanary,
  },
  { event: CAPITOL_CANARY_EMAIL_REP_INNGEST_EVENT_NAME },
  async ({ event, step }) => {
    const data = event.data as EmailRepViaCapitolCanaryPayloadRequirements

    // Format create request.
    const formattedCreateRequest = formatCapitolCanaryAdvocateCreationRequest(data)
    if (formattedCreateRequest instanceof Error) {
      throw new NonRetriableError(formattedCreateRequest.message, {
        cause: formattedCreateRequest,
      })
    }

    // Create the advocate in Capitol Canary.
    // If advocate already exists for the given campaign ID, then that's alright - nothing will happen, which is fine.
    const createAdvocateStepResponse = await step.run(
      'capitol-canary.email-rep.create-advocate-in-capitol-canary',
      async () => {
        const createAdvocateResp = await createAdvocateInCapitolCanary(formattedCreateRequest)
        if (createAdvocateResp.success != 1) {
          throw new NonRetriableError(
            `client error for creating advocate in capitol canary: ${JSON.stringify(
              createAdvocateResp,
            )}`,
          )
        }
        return {
          ...createAdvocateResp,
        }
      },
    )

    // Format email request.
    const formattedEmailRepRequest = formatCapitolCanaryEmailRepRequest({
      ...data,
      advocateId: Number(createAdvocateStepResponse.advocateid),
    })
    if (formattedEmailRepRequest instanceof Error) {
      throw new NonRetriableError(formattedEmailRepRequest.message, {
        cause: formattedEmailRepRequest,
      })
    }

    // Send email to representative via Capitol Canary.
    const emailRepStepResponse = await step.run(
      'capitol-canary.email-rep.email-rep-via-capitol-canary',
      async () => {
        const emailRepResp = await emailRepViaCapitolCanary(formattedEmailRepRequest)
        if (emailRepResp.success != 1) {
          throw new NonRetriableError(
            `client error for emailing rep via capitol canary: ${JSON.stringify(emailRepResp)}`,
          )
        }
        return {
          ...emailRepResp,
        }
      },
    )

    return emailRepStepResponse
  },
)
