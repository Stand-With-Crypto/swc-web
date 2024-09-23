import { CapitolCanaryInstance } from '@prisma/client'
import * as Sentry from '@sentry/nextjs'
import { NonRetriableError } from 'inngest'

import { onFailureCapitolCanary } from '@/inngest/functions/capitolCanary/onFailureCapitolCanary'
import { inngest } from '@/inngest/inngest'
import {
  createAdvocateInCapitolCanary,
  formatCapitolCanaryAdvocateCreationRequest,
} from '@/utils/server/capitolCanary/createAdvocate'
import {
  emailViaCapitolCanary,
  formatCapitolCanaryEmailRequest,
} from '@/utils/server/capitolCanary/email'
import { EmailViaCapitolCanaryPayloadRequirements } from '@/utils/server/capitolCanary/payloadRequirements'
import {
  formatCapitolCanaryAdvocateUpdateRequest,
  updateAdvocateInCapitolCanary,
} from '@/utils/server/capitolCanary/updateAdvocate'
import { prismaClient } from '@/utils/server/prismaClient'

const CAPITOL_CANARY_EMAIL_RETRY_LIMIT = 20

export const CAPITOL_CANARY_EMAIL_INNGEST_FUNCTION_ID = 'capitol-canary.email'
export const CAPITOL_CANARY_EMAIL_INNGEST_EVENT_NAME = 'capitol.canary/email'

export interface CapitolCanaryEmailInngestEventSchema {
  name: typeof CAPITOL_CANARY_EMAIL_INNGEST_EVENT_NAME
  data: EmailViaCapitolCanaryPayloadRequirements
}

/**
 * Refer to `src/bin/smokeTests/capitolCanary/emailWithInngest.ts` to see how to call this function.
 */
export const emailViaCapitolCanaryWithInngest = inngest.createFunction(
  {
    id: CAPITOL_CANARY_EMAIL_INNGEST_FUNCTION_ID,
    retries: CAPITOL_CANARY_EMAIL_RETRY_LIMIT,
    onFailure: onFailureCapitolCanary,
  },
  { event: CAPITOL_CANARY_EMAIL_INNGEST_EVENT_NAME },
  async ({ event, step }) => {
    const data = event.data
    let emailAdvocateId = 0

    // If the user does not have an SwC advocate ID, then we need to create one for them.
    // Otherwise, we can add the stored advocate ID to the emailing campaign.
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
        'capitol-canary.email.create-advocate-in-capitol-canary',
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

      // Assign newly created advocate ID.
      emailAdvocateId = createAdvocateStepResponse.advocateid
    } else {
      // Format update request.
      const formattedUpdateRequest = formatCapitolCanaryAdvocateUpdateRequest(data)
      if (formattedUpdateRequest instanceof Error) {
        throw new NonRetriableError(formattedUpdateRequest.message, {
          cause: formattedUpdateRequest,
        })
      }
      // Update the advocate in Capitol Canary.
      const updateAdvocateStepResponse = await step.run(
        'capitol-canary.email.update-advocate-in-capitol-canary',
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

      // Assign existing advocate ID.
      emailAdvocateId = updateAdvocateStepResponse.advocateid
    }

    if (!emailAdvocateId) {
      throw new NonRetriableError('could not resolve advocate ID')
    }

    // Format email request.
    const formattedEmailRequest = formatCapitolCanaryEmailRequest({
      ...data,
      advocateId: emailAdvocateId,
    })
    if (formattedEmailRequest instanceof Error) {
      throw new NonRetriableError(formattedEmailRequest.message, {
        cause: formattedEmailRequest,
      })
    }
    // Send email to representative via Capitol Canary.
    const emailStepResponse = await step.run(
      'capitol-canary.email.email-via-capitol-canary',
      async () => {
        const emailResp = await emailViaCapitolCanary(formattedEmailRequest)
        if (emailResp.success !== 1) {
          if (emailResp.error) {
            Sentry.captureMessage(`emailViaCapitolCanary error: ${emailResp.error}`, {
              extra: { formattedEmailRequest, data },
              tags: {
                administrativeAreaLevel1: data.user?.address?.administrativeAreaLevel1,
              },
            })
          }
          throw new NonRetriableError(
            `client error for emailing via capitol canary: ${JSON.stringify(emailResp)}`,
          )
        }
        return {
          ...emailResp,
        }
      },
    )

    // Update database with new SwC advocate ID if new ID was created.
    if (
      data.user.capitolCanaryAdvocateId !== emailAdvocateId ||
      data.user.capitolCanaryInstance === CapitolCanaryInstance.LEGACY
    ) {
      await step.run('capitol-canary.email.update-user-with-advocate-id', async () => {
        await prismaClient.user.update({
          where: { id: data.user.id },
          data: {
            capitolCanaryAdvocateId: emailAdvocateId,
            capitolCanaryInstance: CapitolCanaryInstance.STAND_WITH_CRYPTO,
          },
        })
      })
    }

    return emailStepResponse
  },
)
