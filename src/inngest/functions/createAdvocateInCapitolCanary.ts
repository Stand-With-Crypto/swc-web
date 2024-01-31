import { inngest } from '@/inngest/inngest'
import { prismaClient } from '@/utils/server/prismaClient'
import { onFailureCapitolCanary } from '@/inngest/onFailureCapitolCanary'
import {
  createAdvocateInCapitolCanary,
  formatCapitolCanaryAdvocateCreationRequest,
} from '@/utils/server/capitolCanary/createAdvocate'
import { CreateAdvocateInCapitolCanaryPayloadRequirements } from '@/utils/server/capitolCanary/payloadRequirements'
import { NonRetriableError } from 'inngest'
import { CapitolCanaryInstance } from '@prisma/client'

const CAPITOL_CANARY_CREATE_ADVOCATE_RETRY_LIMIT = 20

export const CAPITOL_CANARY_CREATE_ADVOCATE_INNGEST_FUNCTION_ID = 'capitol-canary.create-advocate'
export const CAPITOL_CANARY_CREATE_ADVOCATE_INNGEST_EVENT_NAME = 'capitol.canary/create.advocate'

/**
 * Refer to `src/bin/smokeTests/capitolCanary/createAdvocateWithInngest.ts` to see how to call this function.
 */
export const createAdvocateInCapitolCanaryWithInngest = inngest.createFunction(
  {
    id: CAPITOL_CANARY_CREATE_ADVOCATE_INNGEST_FUNCTION_ID,
    retries: CAPITOL_CANARY_CREATE_ADVOCATE_RETRY_LIMIT,
    onFailure: onFailureCapitolCanary,
  },
  { event: CAPITOL_CANARY_CREATE_ADVOCATE_INNGEST_EVENT_NAME },
  async ({ event, step }) => {
    const data = event.data as CreateAdvocateInCapitolCanaryPayloadRequirements
    const formattedRequest = formatCapitolCanaryAdvocateCreationRequest(data)
    // Do not retry if the request is invalid.
    if (formattedRequest instanceof Error) {
      throw new NonRetriableError(formattedRequest.message, {
        cause: formattedRequest,
      })
    }
    const createStepResponse = await step.run(
      'capitol-canary.create-advocate.create-advocate-in-capitol-canary',
      async () => {
        const createAdvocateResp = await createAdvocateInCapitolCanary(formattedRequest)
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

    // Update database if requested.
    if (data.shouldUpdateUserWithAdvocateId) {
      await step.run('capitol-canary.create-advocate.update-user-with-advocate-id', async () => {
        await prismaClient.user.update({
          where: { id: data.user.id },
          data: {
            capitolCanaryAdvocateId: createStepResponse.advocateid,
            capitolCanaryInstance: CapitolCanaryInstance.STAND_WITH_CRYPTO,
          },
        })
      })
    }

    return createStepResponse
  },
)
