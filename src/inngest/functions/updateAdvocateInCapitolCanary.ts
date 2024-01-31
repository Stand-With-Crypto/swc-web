import { inngest } from '@/inngest/inngest'
import { prismaClient } from '@/utils/server/prismaClient'
import { onFailureCapitolCanary } from '@/inngest/onFailureCapitolCanary'
import { UpdateAdvocateInCapitolCanaryPayloadRequirements } from '@/utils/server/capitolCanary/payloadRequirements'
import { NonRetriableError } from 'inngest'
import { CapitolCanaryInstance } from '@prisma/client'
import {
  formatCapitolCanaryAdvocateUpdateRequest,
  updateAdvocateInCapitolCanary,
} from '@/utils/server/capitolCanary/updateAdvocate'

const CAPITOL_CANARY_UPDATE_ADVOCATE_RETRY_LIMIT = 20

export const CAPITOL_CANARY_UPDATE_ADVOCATE_INNGEST_FUNCTION_ID = 'capitol-canary.update-advocate'
export const CAPITOL_CANARY_UPDATE_ADVOCATE_INNGEST_EVENT_NAME = 'capitol.canary/update.advocate'

/**
 * Refer to `src/bin/smokeTests/capitolCanary/updateAdvocateWithInngest.ts` to see how to call this function.
 */
export const updateAdvocateInCapitolCanaryWithInngest = inngest.createFunction(
  {
    id: CAPITOL_CANARY_UPDATE_ADVOCATE_INNGEST_FUNCTION_ID,
    retries: CAPITOL_CANARY_UPDATE_ADVOCATE_RETRY_LIMIT,
    onFailure: onFailureCapitolCanary,
  },
  { event: CAPITOL_CANARY_UPDATE_ADVOCATE_INNGEST_EVENT_NAME },
  async ({ event, step }) => {
    const data = event.data as UpdateAdvocateInCapitolCanaryPayloadRequirements
    const formattedRequest = formatCapitolCanaryAdvocateUpdateRequest(data)
    // Do not retry if the request is invalid.
    if (formattedRequest instanceof Error) {
      throw new NonRetriableError(formattedRequest.message, {
        cause: formattedRequest,
      })
    }
    const updateStepResponse = await step.run(
      'capitol-canary.update-advocate.update-advocate-in-capitol-canary',
      async () => {
        const updateAdvocateResp = await updateAdvocateInCapitolCanary(formattedRequest)
        if (updateAdvocateResp.success != 1) {
          throw new NonRetriableError(
            `client error for creating advocate in capitol canary: ${JSON.stringify(
              updateAdvocateResp,
            )}`,
          )
        }
        return {
          ...updateAdvocateResp,
        }
      },
    )

    // Update database if requested.
    if (data.shouldUpdateUserWithAdvocateId) {
      await step.run('capitol-canary.update-advocate.update-user-with-advocate-id', async () => {
        await prismaClient.user.update({
          where: { id: data.user.id },
          data: {
            capitolCanaryAdvocateId: updateStepResponse.advocateid,
            capitolCanaryInstance: CapitolCanaryInstance.STAND_WITH_CRYPTO,
          },
        })
      })
    }

    return updateStepResponse
  },
)
