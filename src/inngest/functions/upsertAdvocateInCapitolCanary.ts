import { inngest } from '@/inngest/inngest'
import { onFailureCapitolCanary } from '@/inngest/onFailureCapitolCanary'
import {
  createAdvocateInCapitolCanary,
  formatCapitolCanaryAdvocateCreationRequest,
} from '@/utils/server/capitolCanary/createAdvocate'
import { UpsertAdvocateInCapitolCanaryPayloadRequirements } from '@/utils/server/capitolCanary/payloadRequirements'
import {
  formatCapitolCanaryAdvocateUpdateRequest,
  updateAdvocateInCapitolCanary,
} from '@/utils/server/capitolCanary/updateAdvocate'
import { prismaClient } from '@/utils/server/prismaClient'
import { CapitolCanaryInstance } from '@prisma/client'
import { NonRetriableError } from 'inngest'

const CAPITOL_CANARY_UPSERT_ADVOCATE_RETRY_LIMIT = 20

export const CAPITOL_CANARY_UPSERT_ADVOCATE_INNGEST_FUNCTION_ID = 'capitol-canary.upsert-advocate'
export const CAPITOL_CANARY_UPSERT_ADVOCATE_INNGEST_EVENT_NAME = 'capitol.canary/upsert.advocate'

/**
 * Refer to `src/bin/smokeTests/capitolCanary/upsertAdvocateWithInngest.ts` to see how to call this function.
 */
export const upsertAdvocateInCapitolCanaryWithInngest = inngest.createFunction(
  {
    id: CAPITOL_CANARY_UPSERT_ADVOCATE_INNGEST_FUNCTION_ID,
    retries: CAPITOL_CANARY_UPSERT_ADVOCATE_RETRY_LIMIT,
    onFailure: onFailureCapitolCanary,
  },
  { event: CAPITOL_CANARY_UPSERT_ADVOCATE_INNGEST_EVENT_NAME },
  async ({ event, step }) => {
    const data = event.data as UpsertAdvocateInCapitolCanaryPayloadRequirements

    // If the user does not have an SwC advocate ID, then we need to create one for them.
    if (
      !data.user.capitolCanaryAdvocateId ||
      data.user.capitolCanaryInstance === CapitolCanaryInstance.LEGACY
    ) {
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
        'capitol-canary.upsert-advocate.create-advocate-in-capitol-canary',
        async () => {
          const createAdvocateResp = await createAdvocateInCapitolCanary(formattedCreateRequest)
          if (createAdvocateResp.success !== 1) {
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

      // Update database with new SwC advocate ID.
      await step.run('capitol-canary.upsert-advocate.update-user-with-advocate-id', async () => {
        await prismaClient.user.update({
          where: { id: data.user.id },
          data: {
            capitolCanaryAdvocateId: createAdvocateStepResponse.advocateid,
            capitolCanaryInstance: CapitolCanaryInstance.STAND_WITH_CRYPTO,
          },
        })
      })

      return createAdvocateStepResponse
    }

    // Otherwise, we can update the existing advocate profile appropriately.
    // Format update request.
    const formattedUpdateRequest = formatCapitolCanaryAdvocateUpdateRequest(data)
    if (formattedUpdateRequest instanceof Error) {
      throw new NonRetriableError(formattedUpdateRequest.message, {
        cause: formattedUpdateRequest,
      })
    }
    // Update the advocate in Capitol Canary.
    const updateAdvocateStepResponse = await step.run(
      'capitol-canary.upsert-advocate.update-advocate-in-capitol-canary',
      async () => {
        const updateAdvocateResp = await updateAdvocateInCapitolCanary(formattedUpdateRequest)
        if (updateAdvocateResp.success !== 1) {
          throw new NonRetriableError(
            `client error for updating advocate in capitol canary: ${JSON.stringify(
              updateAdvocateResp,
            )}`,
          )
        }
        return {
          ...updateAdvocateResp,
        }
      },
    )

    // No need to update advocate ID in database since it already exists.

    return updateAdvocateStepResponse
  },
)
